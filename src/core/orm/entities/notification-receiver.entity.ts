import { Mapping } from 'src/core/orm/sql.model';
import { Notifications } from './notification.entity';
import { Users } from './users.entity';

export class NotificationReceiver extends Mapping {
  static table = 'notification_receiver';

  notification_id: number;
  receiver_id: number;
  is_seen: boolean;

  static get relationMappings() {
    return {
      notification: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Notifications,
        join: {
          from: 'notification_receiver.notification_id',
          to: 'notifications.id',
        },
      },
      receiver: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'notification_receiver.receiver_id',
          to: 'users.id',
        },
      },
    };
  }
}
