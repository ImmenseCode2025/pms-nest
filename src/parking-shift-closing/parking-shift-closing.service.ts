import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ParkingShiftClosingHistory } from 'src/core/orm/entities/parking-shift-closing-history.entity';
import { ParkingShiftClosing } from 'src/core/orm/entities/parking-shift-closing.entity';
import { ShiftClosingCollectionDetailHistory } from 'src/core/orm/entities/shift-closing-collection-detail-history.entity';
import { ShiftClosingCollectionDetail } from 'src/core/orm/entities/shift-closing-collection-detail.entity';
import { ShiftClosingPaymentMethodHistory } from 'src/core/orm/entities/shift-closing-payment-method-history.entity';
import { ShiftClosingPaymentMethod } from 'src/core/orm/entities/shift-closing-payment-method.entity';

@Injectable()
export class ParkingShiftClosingService {
  async findOne(id: number) {
    const record = await ParkingShiftClosing.query()
      .findById(id)
      .withGraphFetched(
        '[shiftClosingUsers, shiftClosingSupervisors, shiftClosingParkingSites, shiftClosingHardware, parkingShiftClosingCollectionDetails, parkingShiftClosingPaymentMethods]',
      );

    if (!record) {
      throw new HttpException(
        `Shift closing record #${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return record;
  }

  /**
   * Delete complete Shift Closing (Main record + Details + History records)
   */
  async delete(id: number) {
    const existing = await ParkingShiftClosing.query().findById(id);
    if (!existing) {
      throw new HttpException(
        `Shift closing record #${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await ParkingShiftClosing.transaction(async (trx) => {
      // 1. Find all history records linked to this shiftClosingId
      const historyRecords = await ParkingShiftClosingHistory.query()
        .transacting(trx)
        .where('shiftClosingId', id)
        .select('id');

      const historyIds = historyRecords.map((h: any) => h.id);

      // 2. Delete history detail tables using Entity Model Classes
      if (historyIds.length > 0) {
        await ShiftClosingCollectionDetailHistory.query()
          .transacting(trx)
          .whereIn('shiftClosing', historyIds)
          .delete();

        await ShiftClosingPaymentMethodHistory.query()
          .transacting(trx)
          .whereIn('shiftClosing', historyIds)
          .delete();

        await ParkingShiftClosingHistory.query()
          .transacting(trx)
          .where('shiftClosingId', id)
          .delete();
      }

      // 3. Delete live detail tables using Entity Model Classes
      await ShiftClosingCollectionDetail.query()
        .transacting(trx)
        .where('shiftClosing', id)
        .delete();

      await ShiftClosingPaymentMethod.query()
        .transacting(trx)
        .where('shiftClosing', id)
        .delete();

      // 4. Delete parent Shift Closing record
      await ParkingShiftClosing.query().transacting(trx).deleteById(id);
    });

    return { id, deleted: true };
  }
}
