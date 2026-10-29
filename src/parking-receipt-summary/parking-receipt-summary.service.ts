import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { ParkingReceiptSummary } from 'src/core/orm/entities/parking-receipt-summary.entity';
import { ParkingReceiptSummaryPaginatedDto } from './dto/parking-receipt-summary-paginated.dto';

@Injectable()
export class ParkingReceiptSummaryService {
  // 1. PAGINATED LISTING
  async paginated(data: any = {}) {
    const dto: ParkingReceiptSummaryPaginatedDto = data.dto || {};
    const query = ParkingReceiptSummary.query();

    if (dto?.siteId) {
      query.where('parking_receipt_summary.siteId', dto.siteId);
    }

    if (dto?.handheldId) {
      query.where('parking_receipt_summary.handheldId', dto.handheldId);
    }

    if (dto?.operatorId) {
      query.where('parking_receipt_summary.operatorId', dto.operatorId);
    }

    if (dto?.summary_date) {
      query.where('parking_receipt_summary.summary_date', dto.summary_date);
    }

    if (dto.startDate) {
      query.where('parking_receipt_summary.summary_date', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query.where('parking_receipt_summary.summary_date', '<=', dto.endDate);
    }

    query.withGraphFetched('[site, operator, hardware]');
    query.modifyGraph('site', (builder) => {
      builder.select('id', 'name');
    });
    query.modifyGraph('operator', (builder) => {
      builder.select('id', 'username', 'mobile');
    });
    query.modifyGraph('hardware', (builder) => {
      builder.select('id', 'ipOrApi', 'name');
    });

    query.orderBy('parking_receipt_summary.id', 'desc');

    return await ParkingReceiptSummary.pagination(query, data);
  }

  // 2. READ BY ID
  async findOne(id: number) {
    const item = await ParkingReceiptSummary.query()
      .findById(id)
      .withGraphFetched('[site, operator, hardware]')
      .modifyGraph('site', (builder) => {
        builder.select('id', 'name');
      })
      .modifyGraph('operator', (builder) => {
        builder.select('id', 'username', 'mobile');
      })
      .modifyGraph('hardware', (builder) => {
        builder.select('id', 'ipOrApi', 'name');
      });

    if (!item) {
      AppException.notFound({ message: 'Parking receipt summary not found' });
    }
    return item;
  }

  // 3. DELETE
  async delete(id: number) {
    await this.findOne(id);
    await ParkingReceiptSummary.query().deleteById(id);
    return true;
  }
}
