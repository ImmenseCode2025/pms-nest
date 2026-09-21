import { Mapping } from '../sql.model';

export class CustomerDiscountsCodeValidity extends Mapping {
    static get tableName() {
    return 'customer_discount_codes_validity';
  }

  customerId?: number;
  discountCode?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
