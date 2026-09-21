import { Mapping } from 'src/core/orm/sql.model';

export class Company extends Mapping {
  static table = 'company';

  name?: string;
  addressId?: number;
  contact?: string;
  email?: string;
  logo?: string;
  userId?: number;
  shortCode?: string;
  statusCompany?: "pending" | "active" | "inactive";
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
