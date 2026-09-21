import { Mapping } from 'src/core/orm/sql.model';

export class PaymentMethod extends Mapping {
  static table = 'payment_method';

  name?: string;
  status?: string;
  uploadedDateTime?: Date | string;
  serverId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
