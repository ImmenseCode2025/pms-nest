import { Mapping } from '../sql.model';
import { Corporate } from './corporate.entity';
import { CorporateInvoice } from './corporate-invoice.entity';

export class CorporateBillingPlan extends Mapping {
    static get tableName() {
    return 'corporate_billing_plans';
  }

  id?: number;
  corporateId?: number;
  pricePerVehicle?: number;
  effectiveFrom?: Date | string;
  isActive?: boolean;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      billingPlanCorporate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Corporate,
        join: {
          from: 'corporate_billing_plans.corporateId',
          to: 'corporates.id',
        },
      },
      planInvoices: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateInvoice,
        join: {
          from: 'corporate_billing_plans.id',
          to: 'corporate_invoices.billingPlanId',
        },
      },
    };
  }
}
