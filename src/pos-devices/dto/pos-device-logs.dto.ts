import { IsNotEmpty } from 'class-validator';

export class PosDeviceLogsDto {
  @IsNotEmpty()
  pos_device_id: number;
}
