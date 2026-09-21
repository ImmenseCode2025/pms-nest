import { Mapping } from 'src/core/orm/sql.model';

export class BankCard extends Mapping {
  static table = 'bank_card';

  customerId?: number;
  cardNumber?: string;
  cvvNumber?: string;
  expirationDate?: Date | string;
  holderName?: string;
  saveDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
