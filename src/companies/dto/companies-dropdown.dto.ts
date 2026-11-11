import { IsOptional, IsString } from 'class-validator';

export class CompaniesDropdownDto {
  // Filter by company address city (e.g. 'karachi'); omit for all
  @IsOptional()
  @IsString()
  city?: string;
}
