import { Mapping } from 'src/core/orm/sql.model';

export class CorporateInvoice extends Mapping {
  static table = 'corporate_invoices';

  id?: number;
  invoiceNumber?: string;
  corporateId?: number;
  billingPlanId?: number;
  billingPeriodStart?: Date | string;
  billingPeriodEnd?: Date | string;
  invoiceDate?: Date | string;
  dueDate?: Date | string;
  billableVehicleCount?: number;
  pricePerVehicle?: number;
  subtotal?: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  arrears?: number;
  status?: "draft" | "issued" | "pending" | "paid" | "partially_paid" | "overdue" | "payment_submitted" | "under_review" | "declined";
  vehicleSnapshot?: any;
  pdfPath?: string;
  notes?: string;
  billingBreakdown?: any;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
