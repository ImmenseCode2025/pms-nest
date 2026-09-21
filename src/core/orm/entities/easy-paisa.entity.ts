import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class EasyPaisa extends Mapping {
    static get tableName() {
    return 'easypaisa';
  }

  customerId?: number;
  accountNumber?: string;
  cardStatus?: "active" | "inactive" | "temporary down";
  saveDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      easyPaisaCustomers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'easypaisa.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
