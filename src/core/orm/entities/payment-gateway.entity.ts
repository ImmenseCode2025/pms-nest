import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Payment } from './payment.entity';

export class PaymentGateway extends Mapping {
    static get tableName() {
    return 'payment_gateway';
  }

  name?: string;
  userId?: number;
  status?: "active" | "inactive" | "outOfService";
  logo?: string;
  registerDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

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
