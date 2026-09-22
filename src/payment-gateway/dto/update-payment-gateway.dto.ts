import { IsNotEmpty } from 'class-validator';

export class UpdatePaymentGatewayDto {
  @IsNotEmpty()
  id: number;
  
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  status?: 'active' | 'inactive' | 'outOfService';

  @IsNotEmpty()
  logo?: string;
}
