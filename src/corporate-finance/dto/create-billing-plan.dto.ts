import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBillingPlanDto {
  @IsNotEmpty({ message: 'corporateId and pricePerVehicle are required' })
  corporateId: number | string;

  @IsNotEmpty({ message: 'corporateId and pricePerVehicle are required' })
  pricePerVehicle: number | string;

  // 'YYYY-MM-DD' or an ISO datetime (admin panel sends new Date(x).toISOString())
  @IsOptional()
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
