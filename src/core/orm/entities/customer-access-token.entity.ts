import { Mapping } from 'src/core/orm/sql.model';

export class CustomerAccessToken extends Mapping {
  static table = 'customer_access_token';

  customerId?: number;
  token?: string;
  macAddress?: string;
  generatedDateTime?: Date | string;
  tokenStatus?: "active" | "expired";
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
