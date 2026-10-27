import { IsOptional } from 'class-validator';

export class OperatorPaginatedDto {
  @IsOptional()
  search_text: string;

  @IsOptional()
  site_id?: number;

  @IsOptional()
  supervisor_id?: number;

  @IsOptional()
  status?: string;
}
