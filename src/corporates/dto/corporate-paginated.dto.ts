import { IsOptional, IsString } from 'class-validator';

export class CorporatePaginatedDto {
  @IsOptional()
  @IsString()
  search_text?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;
}

