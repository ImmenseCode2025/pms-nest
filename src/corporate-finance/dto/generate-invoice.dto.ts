import { IsNotEmpty, IsOptional } from 'class-validator';
import { AppInputDateDecorator } from 'src/core/decorators/app-input-date-decorator';

export class GenerateCorporateInvoiceDto {
  @IsNotEmpty({ message: 'corporateId, periodStart, and periodEnd are required' })
  corporateId: number | string;

  @IsNotEmpty({ message: 'corporateId, periodStart, and periodEnd are required' })
  @AppInputDateDecorator({ message: 'periodStart must be in YYYY-MM-DD format' })
  periodStart: string;

  @IsNotEmpty({ message: 'corporateId, periodStart, and periodEnd are required' })
  @AppInputDateDecorator({ message: 'periodEnd must be in YYYY-MM-DD format' })
  periodEnd: string;

  @IsOptional()
  notes?: string;

  // Flat discount amount (PKR)
  @IsOptional()
  discount?: number | string;
}
