import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Message } from './message.entity';

export class Room extends Mapping {
    static get tableName() {
    return 'rooms';
  }

  name?: string;
  owner?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      roomOwner: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'rooms.owner',
          to: 'user.id',
        },
      },
      messages: {
        relation: Mapping.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'rooms.id',
          to: 'messages.roomId',
        },
      },
    };
  }
}
