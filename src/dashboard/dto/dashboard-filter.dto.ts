import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardFilterDto {
  @IsOptional()
  siteId?: number;
}
