import { Mapping } from 'src/core/orm/sql.model';

export class Room extends Mapping {
  static table = 'rooms';

  name?: string;
  owner?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
