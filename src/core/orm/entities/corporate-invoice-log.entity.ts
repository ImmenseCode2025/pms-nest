import { Mapping } from '../sql.model';
import { CorporateInvoice } from './corporate-invoice.entity';

export class CorporateInvoiceLog extends Mapping {
    static get tableName() {
    return 'corporate_invoice_logs';
  }

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
    return {
      logInvoice: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: CorporateInvoice,
        join: {
          from: 'corporate_invoice_logs.invoiceId',
          to: 'corporate_invoices.id',
        },
      },
    };
  }
}
