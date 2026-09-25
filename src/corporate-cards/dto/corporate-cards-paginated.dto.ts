import { IsOptional } from 'class-validator';

export class CorporateCardsPaginatedDto {
  @IsOptional()
  search?: string;

}
