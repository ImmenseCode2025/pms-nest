import { Mapping } from 'src/core/orm/sql.model';

export class RoomMember extends Mapping {
  static table = 'room_members';

  roomId?: number;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
