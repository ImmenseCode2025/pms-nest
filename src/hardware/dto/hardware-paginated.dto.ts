import { IsOptional } from 'class-validator';

export class HardwarePaginatedDto {
  @IsOptional()
  siteId?: number;

  @IsOptional()
  search?: string;
}
