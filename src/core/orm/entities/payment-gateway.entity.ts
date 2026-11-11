import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Payment } from './payment.entity';

export class PaymentGateway extends Mapping {
    static get tableName() {
    return 'payment_gateway';
  }

  id?: number;
  name?: string;
  registerDateTime?: Date | string;
  user?: number;
  status?: 'active' | 'inactive' | 'outOfService';
  logo?: string;
  updatedAt?: Date | string;
  createdAt?: Date | string;

    static get relationMappings() {
    return {
      gatewayUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'payment_gateway.user',
          to: 'user.id',
        },
      },
      gatewayPayments: {
        relation: Mapping.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'payment_gateway.id',
          to: 'payment.paymentGateway',
        },
      },
    };
  }
}
