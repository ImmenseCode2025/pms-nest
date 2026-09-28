import { Module } from '@nestjs/common';
import { ParkingShiftClosingController } from './parking-shift-closing.controller';
import { ParkingShiftClosingService } from './parking-shift-closing.service';

@Module({
  controllers: [ParkingShiftClosingController],
  providers: [ParkingShiftClosingService],
  exports: [ParkingShiftClosingService],
})
export class ParkingShiftClosingModule {}
