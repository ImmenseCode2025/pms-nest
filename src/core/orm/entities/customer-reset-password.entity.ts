import { Mapping } from 'src/core/orm/sql.model';

export class CustomerResetPassword extends Mapping {
  static table = 'customer_reset_password_otp';

  resetCode?: string;
  customerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
