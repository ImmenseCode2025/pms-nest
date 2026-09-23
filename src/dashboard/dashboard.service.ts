import { Injectable } from '@nestjs/common';
import { raw } from 'objection';
import { ParkingSite, ParkingToken } from 'src/core/orm/entities';
@Injectable()
export class DashboardService {
  async getDashboardData() {
    const [statCards, dailyParkingTrend, recentTransactions] =
      await Promise.all([
        this.getStatCards(),
        this.getDailyParkingTrend(),
        this.getRecentTransactions(),
      ]);
    return { statCards, dailyParkingTrend, recentTransactions };
  }

  private async getStatCards() {
    const totalParkingSites = await ParkingSite.query().resultSize();
    return { totalParkingSites };
  }

  private async getDailyParkingTrend() {
    const rows: any[] = await ParkingToken.query()
      .select(raw(`DATE_FORMAT(checkInDateTime, '%Y-%m-%d')`).as('day'))
      .count({ total: 'id' })
      .groupBy('day')
      .orderBy('day');

    return rows.map((row) => ({ label: row.day, value: Number(row.total) }));
  }

  private async getRecentTransactions() {
  let result  = await ParkingToken.query()
        .select('id', 'tokenNumber', 'checkInDateTime', 'checkOutDateTime', 'status')
        .withGraphFetched('[parking_site,parking_receipt]')
        .orderBy('checkInDateTime', 'desc')
        .limit(10)

    return result
  }
}
