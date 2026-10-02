import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class DashboardFilterDto {
  @IsOptional()
  @IsNumber()
  siteId?: number;

  @IsOptional()
  @IsNumber()
  paymentMethod?: number;

  @IsOptional()
  @IsNumber()
  vehicleType?: number;

  @IsOptional()
  deviceType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
