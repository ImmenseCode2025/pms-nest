import { Module } from '@nestjs/common';
import { PosDeviceLogsHelper } from './helpers/pos-device-logs.helper';
import { PosDevicesController } from './pos-devices.controller';
import { PosDevicesService } from './pos-devices.service';

@Module({
  controllers: [PosDevicesController],
  providers: [PosDevicesService, PosDeviceLogsHelper],
  exports: [PosDevicesService],
})
export class PosDevicesModule {}
