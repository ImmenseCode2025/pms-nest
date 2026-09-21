import { Mapping } from '../sql.model';
import { Corporate } from './corporate.entity';
import { CorporateBillingPlan } from './corporate-billing-plan.entity';
import { CorporateInvoicePayment } from './corporate-invoice-payment.entity';
import { CorporateInvoiceLog } from './corporate-invoice-log.entity';

export class CorporateInvoice extends Mapping {
    static get tableName() {
    return 'corporate_invoices';
  }

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
    return {
      invoiceCorporate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Corporate,
        join: {
          from: 'corporate_invoices.corporateId',
          to: 'corporates.id',
        },
      },
      invoiceBillingPlan: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: CorporateBillingPlan,
        join: {
          from: 'corporate_invoices.billingPlanId',
          to: 'corporate_billing_plans.id',
        },
      },
      payments: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateInvoicePayment,
        join: {
          from: 'corporate_invoices.id',
          to: 'corporate_invoice_payments.invoiceId',
        },
      },
      logs: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateInvoiceLog,
        join: {
          from: 'corporate_invoices.id',
          to: 'corporate_invoice_logs.invoiceId',
        },
      },
    };
  }
}
