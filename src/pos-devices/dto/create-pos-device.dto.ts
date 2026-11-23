import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePosDeviceDto {
  @IsNotEmpty()
  serial_number: string;

  @IsNotEmpty()
  bank: string;

  @IsNotEmpty()
  site_id: number;
}
