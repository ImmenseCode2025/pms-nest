import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class CustomerAccessToken extends Mapping {
    static get tableName() {
    return 'customer_access_token';
  }

  id?: number;
  customer?: number;
  token?: string;
  macAddress?: string;
  generatedDateTime?: Date | string;
  status?: 'active' | 'expired';
  creationDateTime?: Date | string;
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
