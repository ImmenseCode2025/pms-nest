import { IsOptional } from 'class-validator';

export class ParkingReceiptSummaryPaginatedDto {
  @IsOptional()
  siteId?: number;

  @IsOptional()
  handheldId?: number;

  @IsOptional()
  operatorId?: number;

  @IsOptional()
  summary_date?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  search_text?: string;
}

