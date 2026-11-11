import { IsOptional } from 'class-validator';

export class FocPaginatedDto {
  @IsOptional()
  search_text?: string;

  @IsOptional()
  site_id?: number;
}
