import { IsOptional } from 'class-validator';

export class ApproveCorporateDto {
  // Price per vehicle for the default billing plan (number or numeric string).
  @IsOptional()
  pricePlan?: number | string;
}
