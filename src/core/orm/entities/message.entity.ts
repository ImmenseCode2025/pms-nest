import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Room } from './room.entity';

export class Message extends Mapping {
    static get tableName() {
    return 'messages';
  }

  roomId?: number;
  sender?: string;
  userId?: number;
  message?: string;
  timestamp?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      msgSender: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'messages.userId',
          to: 'user.id',
        },
      },
      roomMessages: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'messages.roomId',
          to: 'rooms.id',
        },
      },
    };
  }
}
