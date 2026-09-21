import { Mapping } from 'src/core/orm/sql.model';

export class Notifications extends Mapping {
  static table = 'notification';

  title?: string;
  message?: string;
  customerId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
