import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class Notifications extends Mapping {
    static get tableName() {
    return 'notification';
  }

  title?: string;
  message?: string;
  customerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      notificationsCustomers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'notification.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
