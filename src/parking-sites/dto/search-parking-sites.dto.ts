import { IsOptional } from 'class-validator';

export class SearchParkingSitesDto {
  @IsOptional()
  search?: string;
}
