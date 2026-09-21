import { Mapping } from 'src/core/orm/sql.model';

export class PaymentGateway extends Mapping {
  static table = 'payment_gateway';

  name?: string;
  userId?: number;
  status?: "active" | "inactive" | "outOfService";
  logo?: string;
  registerDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
