import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';

export class BankCard extends Mapping {
    static get tableName() {
    return 'bank_card';
  }

  customerId?: number;
  cardNumber?: string;
  cvvNumber?: string;
  expirationDate?: Date | string;
  holderName?: string;
  saveDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      cardCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'bank_card.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
