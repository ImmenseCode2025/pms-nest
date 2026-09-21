import { Mapping } from '../sql.model';
import { CorporateInvoice } from './corporate-invoice.entity';

export class CorporateInvoicePayment extends Mapping {
    static get tableName() {
    return 'corporate_invoice_payments';
  }

  id?: number;
  invoiceId?: number;
  amount?: number;
  paymentDate?: Date | string;
  paymentMethod?: string;
  referenceNumber?: string;
  recordedBy?: number;
  notes?: string;
  receiptUrl?: string;
  receiptFile?: string;
  paymentStatus?: "pending" | "approved" | "declined";
  declineReason?: string;
  submittedByCorporate?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      paymentInvoice: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: CorporateInvoice,
        join: {
          from: 'corporate_invoice_payments.invoiceId',
          to: 'corporate_invoices.id',
        },
      },
    };
  }
}
