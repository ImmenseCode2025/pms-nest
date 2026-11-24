import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class ParkingTicketsPaginatedDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  resultsPerPage?: number;

  @IsOptional()
  site?: number;

  @IsOptional()
  vehicleType?: number;

  @IsOptional()
  deviceType?: string; // 'system' | 'handheld' | null (both)

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;
}

export class GeneralInquiryDto {
  @IsNotEmpty()
  search_text: string;

  @IsNotEmpty()
  @IsIn(['vehicle', 'ticket'])
  type: string;
}
