import { IsOptional } from 'class-validator';

export class VehicleTypePaginatedDto {
  @IsOptional()
  search_text?: string;
}
