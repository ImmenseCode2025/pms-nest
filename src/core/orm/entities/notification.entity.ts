import { Mapping } from 'src/core/orm/sql.model';
import { NotificationReceiver } from './notification-receiver.entity';
import { Users } from './users.entity';

export class Notifications extends Mapping {
  static table = 'notifications';

  title: string;
  text: string;
  source_id: number;
  sender_id: number;
  type: string;
  related_id: number;
  related_type: string;

  static get relationMappings() {
    return {
      sender: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'notifications.sender_id',
          to: 'users.id',
        },
      },

      receivers: {
        relation: Mapping.HasManyRelation,
        modelClass: NotificationReceiver,
        join: {
          from: 'notifications.id',
          to: 'notification_receiver.notification_id',
        },
      },
      receiver: {
        relation: Mapping.HasOneRelation,
        modelClass: NotificationReceiver,
        join: {
          from: 'notifications.id',
          to: 'notification_receiver.notification_id',
        },
        modify: (builder) => {
          Notifications.authFilter(builder, 'receiver_id');
        },
      },
    };
  }
}
