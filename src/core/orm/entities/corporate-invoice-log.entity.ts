import { Mapping } from 'src/core/orm/sql.model';

export class CorporateInvoiceLog extends Mapping {
  static table = 'corporate_invoice_logs';

  id?: number;
  invoiceId?: number;
  action?: string;
  previousStatus?: string;
  newStatus?: string;
  performedBy?: number;
  meta?: any;
  billingBreakdown?: any;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
