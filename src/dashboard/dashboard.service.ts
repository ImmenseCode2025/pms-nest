import { Injectable } from '@nestjs/common';
import { raw } from 'objection';
import { ParkingSite, ParkingToken } from 'src/core/orm/entities';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Injectable()
export class DashboardService {
  async getDashboardData(dto: DashboardFilterDto) {
    const [statCards, dailyParkingTrend, recentTransactions] = await Promise.all([
      this.getStatCards(dto),
      this.getDailyParkingTrend(dto),
      this.getRecentTransactions(dto),
    ]);
    return { statCards, dailyParkingTrend, recentTransactions };
  }

  private async getStatCards(dto: DashboardFilterDto) {
    const siteQuery = ParkingSite.query();
    if (dto.siteId) siteQuery.where('id', dto.siteId);
    const totalParkingSites = await siteQuery.resultSize();

    const tokenQuery = ParkingToken.query();
    if (dto.siteId) tokenQuery.where('site', dto.siteId);
    const totalTokens = await tokenQuery.resultSize();

    return { totalParkingSites, totalTokens };
  }

  private async getDailyParkingTrend(dto: DashboardFilterDto) {
    const query = ParkingToken.query()
      .select(raw(`DATE_FORMAT(checkInDateTime, '%Y-%m-%d')`).as('day'))
      .count({ total: 'id' })
      .groupBy('day')
      .orderBy('day');

    if (dto.siteId) query.where('site', dto.siteId);

    const rows: any[] = await ParkingToken.findAllCustom(query);
    return rows.map((row) => ({ label: row.day, value: Number(row.total) }));
  }

  private async getRecentTransactions(dto: DashboardFilterDto) {
    const query = ParkingToken.query()
      .select('id', 'tokenNumber', 'checkInDateTime', 'checkOutDateTime', 'status')
      .withGraphFetched('[parking_site, parking_receipt]')
      .orderBy('checkInDateTime', 'desc')
      .limit(10);

    if (dto.siteId) query.where('site', dto.siteId);

    return ParkingToken.findAllCustom(query);
  }
}
