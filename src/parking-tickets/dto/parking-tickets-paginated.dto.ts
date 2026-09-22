import { IsOptional } from 'class-validator';

export class ParkingTicketsPaginatedDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  checkInDate?: string;

  @IsOptional()
  date?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  site?: number | string;

  @IsOptional()
  paymentMethod?: string | number;

  @IsOptional()
  vehicleType?: string | number;

  @IsOptional()
  page?: number;

  @IsOptional()
  resultsPerPage?: number;

  @IsOptional()
  limit?: number;
}
