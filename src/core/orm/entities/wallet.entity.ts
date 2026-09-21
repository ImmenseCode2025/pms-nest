import { Mapping } from 'src/core/orm/sql.model';

export class Wallet extends Mapping {
  static table = 'wallet';

  customerId?: number;
  cent?: number;
  topUpDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
