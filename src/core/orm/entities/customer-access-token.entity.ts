import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class CustomerAccessToken extends Mapping {
    static get tableName() {
    return 'customer_access_token';
  }

  customerId?: number;
  token?: string;
  macAddress?: string;
  generatedDateTime?: Date | string;
  tokenStatus?: "active" | "expired";
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      customerAccessTokens: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'customer_access_token.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
