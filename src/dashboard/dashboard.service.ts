import { Injectable } from '@nestjs/common';
import { raw } from 'objection';
import { ParkingSite, ParkingToken } from 'src/core/orm/entities';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

const COMPANY_ID = 7;

@Injectable()
export class DashboardService {
  async getDashboardData(dto: DashboardFilterDto = {}) {
    const [statCards, dailyParkingTrend, recentTransactions] =
      await Promise.all([
        this.getStatCards(dto),
        this.getDailyParkingTrend(dto),
        this.getRecentTransactions(dto),
      ]);
    return { statCards, dailyParkingTrend, recentTransactions };
  }

  private applyFilters(query, dto: DashboardFilterDto) {
    query.whereIn(
      'parking_token.site',
      ParkingSite.query().select('id').where('company', COMPANY_ID),
    );
    if (dto.siteId) query.where('parking_token.site', dto.siteId);
    if (dto.paymentMethod)
      query.where('parking_token.paymentMethod', dto.paymentMethod);
    if (dto.vehicleType)
      query.where('parking_token.vehicleType', dto.vehicleType);
    if (dto.startDate)
      query.whereRaw('DATE(parking_token.checkInDateTime) BETWEEN ? AND ?', [
        dto.startDate,
        dto.endDate || dto.startDate,
      ]);
    return query;
  }

  private async getStatCards(dto: DashboardFilterDto) {
    const siteQuery = ParkingSite.query().where('company', COMPANY_ID);
    if (dto.siteId) siteQuery.where('id', dto.siteId);

    // Revenue only counts checked-out tokens parked for more than 15 minutes
    const vehicleQuery = ParkingToken.query()
      .leftJoinRelated('parking_price')
      .select('parking_token.vehicleType')
      .count({ totalParking: 'parking_token.id' })
      .select(
        raw(`SUM(CASE
          WHEN parking_token.checkOutDateTime IS NOT NULL
            AND TIMESTAMPDIFF(MINUTE, parking_token.checkInDateTime, parking_token.checkOutDateTime) > 15
          THEN parking_price.amount ELSE 0 END)`).as('totalRevenue'),
      )
      .withGraphFetched('vehicle_type')
      .groupBy('parking_token.vehicleType');
    this.applyFilters(vehicleQuery, dto);

    const [totalParkingSites, rows] = await Promise.all([
      siteQuery.resultSize(),
      ParkingToken.findAllCustom(vehicleQuery),
    ]);

    const vehicleTypes = rows.map((row) => ({
      id: row.vehicleType,
      name: row.vehicle_type?.name,
      totalParking: Number(row.totalParking),
      totalRevenue: Number(row.totalRevenue ?? 0),
    }));

    return {
      totalParkingSites,
      totalParking: vehicleTypes.reduce((sum, v) => sum + v.totalParking, 0),
      totalRevenue: vehicleTypes.reduce((sum, v) => sum + v.totalRevenue, 0),
      vehicleTypes,
    };
  }

  private async getDailyParkingTrend(dto: DashboardFilterDto) {
    const query = ParkingToken.query()
      .select(raw(`DATE_FORMAT(checkInDateTime, '%Y-%m-%d')`).as('day'))
      .count({ total: 'id' })
      .groupBy('day')
      .orderBy('day');
    this.applyFilters(query, dto);

    const rows: any[] = await ParkingToken.findAllCustom(query);
    return rows.map((row) => ({ label: row.day, value: Number(row.total) }));
  }

  private async getRecentTransactions(dto: DashboardFilterDto) {
    const query = ParkingToken.query()
      .select(
        'id',
        'tokenNumber',
        'site',
        'vehicleType',
        'carNo',
        'checkInDateTime',
        'checkOutDateTime',
        'status',
      )
      .withGraphFetched('[parking_site, parking_receipt, vehicle_type]')
      .orderBy('checkInDateTime', 'desc')
      .limit(10);
    this.applyFilters(query, dto);

    return ParkingToken.findAllCustom(query);
  }
}
