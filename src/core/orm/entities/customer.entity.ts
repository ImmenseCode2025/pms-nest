import { Mapping } from 'src/core/orm/sql.model';

export class Customer extends Mapping {
  static table = 'customer';

  email?: string;
  username?: string;
  password?: string;
  contact?: string;
  cnic?: string;
  addressId?: number;
  profilePic?: string;
  statusProfile?: "incomplete" | "completed" | "block" | "deleted";
  creationSource?: "google" | "microsoft" | "facebook" | "manual" | "apple";
  platform?: "Smart Parking" | "Parking Website" | "Islamabad App";
  fullAddress?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
