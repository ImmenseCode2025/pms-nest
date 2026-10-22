import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AppInputDateDecorator } from 'src/core/decorators/app-input-date-decorator';

export class GenerateInvoiceDto {
  @IsNumber()
  corporateId: number; // Format: 'YYYY-MM', e.g. '2026-10'

  @IsNotEmpty()
  @AppInputDateDecorator({
    message: 'Billing Period Start must be in YYYY-MM-DD format',
  })
  billingPeriodStart?: string; // e.g. '2026-10-01'

  @IsNotEmpty()
  @AppInputDateDecorator({
    message: 'Billing Period End must be in YYYY-MM-DD format',
  })
  billingPeriodEnd?: string; 

  @IsOptional()
  @IsString()
  notes?: string;
}
