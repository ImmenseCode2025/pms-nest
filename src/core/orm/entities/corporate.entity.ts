import { Mapping } from 'src/core/orm/sql.model';

export class Corporate extends Mapping {
  static table = 'corporates';

  name?: string;
  registrationNumber?: string;
  email?: string;
  addressId?: number;
  location?: string;
  contactPersonName?: string;
  contactNumber?: string;
  password?: string;
  statusCorporate?: "pending" | "approved" | "rejected";
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
