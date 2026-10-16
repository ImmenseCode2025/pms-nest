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
  billingPeriodEnd?: string; // e.g. '2026-10-31'

  // invoiceNumber?: string;
  // billingPlanId?: number;
  // invoiceDate?: Date | string;
  // dueDate?: Date | string;
  // billableVehicleCount?: number;
  // pricePerVehicle?: number;
  // subtotal?: number;
  // discount?: number;
  // taxRate?: number;
  // taxAmount?: number;
  // totalAmount?: number;
  // paidAmount?: number;
  // arrears?: number;
  // status?: "draft" | "issued" | "pending" | "paid" | "partially_paid" | "overdue" | "payment_submitted" | "under_review" | "declined";
  // vehicleSnapshot?: any;
  // pdfPath?: string;
  // notes?: string;
  // billingBreakdown?: any;
  // createdAt?: Date | string;
  // updatedAt?: Date | string;

  @IsOptional()
  @IsString()
  notes?: string;
}
