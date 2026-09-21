import { Mapping } from 'src/core/orm/sql.model';

export class CorporateBillingPlan extends Mapping {
  static table = 'corporate_billing_plans';

  id?: number;
  corporateId?: number;
  pricePerVehicle?: number;
  effectiveFrom?: Date | string;
  isActive?: boolean;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
