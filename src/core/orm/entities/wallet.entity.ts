import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';
import { TopUp } from './top-up.entity';

export class Wallet extends Mapping {
    static get tableName() {
    return 'wallet';
  }

  customerId?: number;
  cent?: number;
  topUpDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      walletCustomers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'wallet.customer',
          to: 'customer.id',
        },
      },
      walletTopUps: {
        relation: Mapping.HasManyRelation,
        modelClass: TopUp,
        join: {
          from: 'wallet.id',
          to: 'topup.wallet',
        },
      },
    };
  }
}
