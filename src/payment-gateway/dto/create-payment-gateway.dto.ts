import { IsNotEmpty } from 'class-validator';

export class CreatePaymentGatewayDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  status?: 'active' | 'inactive' | 'outOfService';

  @IsNotEmpty()
  logo?: string;
}
