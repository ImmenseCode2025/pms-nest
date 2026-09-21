import { Mapping } from 'src/core/orm/sql.model';

export class Message extends Mapping {
  static table = 'messages';

  roomId?: number;
  sender?: string;
  userId?: number;
  message?: string;
  timestamp?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
