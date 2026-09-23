import { IsOptional } from 'class-validator';

export class ParkingTicketsPaginatedDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  resultsPerPage?: number;
}
