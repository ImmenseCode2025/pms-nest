import { Injectable } from '@nestjs/common';
import { ParkingToken } from 'src/core/orm/entities';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

const COMPANY_ID = 7;

@Injectable()
export class DashboardService {
  async getDashboardData(dto: DashboardFilterDto = {}) {
    const siteId = dto.siteId ? Number(dto.siteId) : null;
    const paymentMethod = dto.paymentMethod ? Number(dto.paymentMethod) : null;
    const vehicleType = dto.vehicleType ? Number(dto.vehicleType) : null;
    const startDate = dto.startDate?.trim() || null;
    const endDate = dto.endDate?.trim() || null;

    const dbResult: any = await ParkingToken.knex().raw(
      `CALL sp_get_admin_dashboard(?, ?, ?, ?, ?, ?)`,
      [COMPANY_ID, siteId, paymentMethod, vehicleType, startDate, endDate],
    );

    const resultSets = dbResult?.[0] || [];
    const totalSitesSet = resultSets[0] || [];
    const vehicleTypes = (resultSets[1] || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      totalParking: Number(row.totalParking || 0),
      totalFoc: Number(row.totalFoc || 0),
      totalRevenue: Number(row.totalRevenue || 0),
    }));
    const dailyParkingTrend = (resultSets[2] || []).map((row: any) => ({
      label: row.label,
      value: Number(row.value || 0),
    }));
    const recentTransactions = resultSets[3] || [];

    const totalParkingSites = Number(totalSitesSet[0]?.total_sites || 0);
    const totalParking = vehicleTypes.reduce((sum, v) => sum + v.totalParking, 0);
    const totalFoc = vehicleTypes.reduce((sum, v) => sum + v.totalFoc, 0);
    const totalRevenue = vehicleTypes.reduce((sum, v) => sum + v.totalRevenue, 0);

    return {
      statCards: {
        totalParkingSites,
        totalParking,
        totalFoc,
        totalRevenue,
        vehicleTypes,
      },
      dailyParkingTrend,
      recentTransactions,
    };
  }
}

