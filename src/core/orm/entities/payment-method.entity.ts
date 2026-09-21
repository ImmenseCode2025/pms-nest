import { Mapping } from '../sql.model';
import { ParkingToken } from './parking-token.entity';

export class PaymentMethod extends Mapping {
    static get tableName() {
    return 'payment_method';
  }

  name?: string;
  status?: string;
  uploadedDateTime?: Date | string;
  serverId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      paymentMethodParkingTokens: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingToken,
        join: {
          from: 'payment_method.id',
          to: 'parking_token.paymentMethod',
        },
      },
    };
  }
}
