import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { CreatePosDeviceDto } from './create-pos-device.dto';

export class UpdatePosDeviceDto extends PartialType(CreatePosDeviceDto) {
  @IsNotEmpty()
  id: number;
}
