import { IsOptional } from 'class-validator';

export class PosDevicePaginatedDto {
  @IsOptional()
  site_id?: number;

  @IsOptional()
  bank?: string;

  @IsOptional()
  search?: string;
}
