import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class HardwareFilterDto {
  @IsNotEmpty()
  siteId: number;
}
