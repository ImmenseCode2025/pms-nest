import { Module } from '@nestjs/common';
import { ParkingReceiptSummaryController } from './parking-receipt-summary.controller';
import { ParkingReceiptSummaryService } from './parking-receipt-summary.service';

@Module({
  controllers: [ParkingReceiptSummaryController],
  providers: [ParkingReceiptSummaryService],
  exports: [ParkingReceiptSummaryService],
})
export class ParkingReceiptSummaryModule {}

