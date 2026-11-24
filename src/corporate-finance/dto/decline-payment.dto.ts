import { IsOptional, IsString } from 'class-validator';

export class DeclinePaymentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
