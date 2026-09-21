import { Mapping } from 'src/core/orm/sql.model';

export class JazzCash extends Mapping {
  static table = 'jazzcash';

  customerId?: number;
  accountNumber?: string;
  cardStatus?: "active" | "inactive" | "temporary down";
  saveDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
