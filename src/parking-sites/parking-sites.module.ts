import { Module } from '@nestjs/common';
import { ParkingSitesController } from './parking-sites.controller';
import { ParkingSitesService } from './parking-sites.service';

@Module({
  controllers: [ParkingSitesController],
  providers: [ParkingSitesService],
  exports: [ParkingSitesService],
})
export class ParkingSitesModule {}
