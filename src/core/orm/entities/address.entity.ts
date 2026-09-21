import { Mapping } from 'src/core/orm/sql.model';

export class Address extends Mapping {
  static table = 'address';

  name?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: number;
  longitude?: number;
  latitude?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
