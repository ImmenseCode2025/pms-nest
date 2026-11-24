import { IsOptional, IsString } from 'class-validator';

// GET payments/search — Query: { page?, limit?, search? }
export class SearchPaymentsDto {
  @IsOptional()
  page?: any;

  @IsOptional()
  limit?: any;

  // Matches parking_token.tokenNumber or payment_gateway.name (LIKE %search%)
  @IsOptional()
  @IsString()
  search?: string;
}
