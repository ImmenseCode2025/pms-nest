import { IsOptional } from 'class-validator';

export class PaymentGatewayPaginatedDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  status?: string;

}
