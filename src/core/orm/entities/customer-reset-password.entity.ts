import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class CustomerResetPassword extends Mapping {
    static get tableName() {
    return 'customer_reset_password_otp';
  }

  resetCode?: string;
  customerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      resetPasswordCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'customer_reset_password_otp.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
