import { Mapping } from '../sql.model';

export class RoomMember extends Mapping {
    static get tableName() {
    return 'room_members';
  }

  roomId?: number;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
