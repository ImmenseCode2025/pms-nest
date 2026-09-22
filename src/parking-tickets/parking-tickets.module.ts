import { Module } from '@nestjs/common';
import { ParkingTicketsController } from './parking-tickets.controller';
import { ParkingTicketsService } from './parking-tickets.service';

@Module({
  controllers: [ParkingTicketsController],
  providers: [ParkingTicketsService],
  exports: [ParkingTicketsService],
})
export class ParkingTicketsModule {}
