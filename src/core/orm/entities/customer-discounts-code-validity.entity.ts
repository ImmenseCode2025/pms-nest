import { Mapping } from 'src/core/orm/sql.model';

export class CustomerDiscountsCodeValidity extends Mapping {
  static table = 'customer_discount_codes_validity';

  customerId?: number;
  discountCode?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
