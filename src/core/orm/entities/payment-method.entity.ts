import { Mapping } from '../sql.model';
import { ParkingToken } from './parking-token.entity';

export class PaymentMethod extends Mapping {
    static get tableName() {
    return 'payment_method';
  }

  id?: number;
  name?: string;
  status?: string;
  generatedDateTime?: Date | string;
  uploadedDateTime?: Date | string;
  server?: number;
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
