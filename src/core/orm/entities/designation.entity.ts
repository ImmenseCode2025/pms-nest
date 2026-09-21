import { Mapping } from 'src/core/orm/sql.model';

export class Designation extends Mapping {
  static table = 'designation';

  name?: string;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
