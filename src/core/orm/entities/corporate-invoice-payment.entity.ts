import { Mapping } from 'src/core/orm/sql.model';

export class CorporateInvoicePayment extends Mapping {
  static table = 'corporate_invoice_payments';

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
    return {};
  }
}
