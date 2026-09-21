import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class JazzCash extends Mapping {
    static get tableName() {
    return 'jazzcash';
  }

  customerId?: number;
  accountNumber?: string;
  cardStatus?: "active" | "inactive" | "temporary down";
  saveDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      jazzCashCustomers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'jazzcash.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
