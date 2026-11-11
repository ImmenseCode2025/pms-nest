import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Corporate } from './corporate.entity';

export class PortalNotification extends Mapping {
    static get tableName() {
    return 'portal_notifications';
  }

  id?: number;
  title?: string;
  message?: string;
  user?: number;
  corporateId?: number;
  createdBy?: number;
  portalType?: string;
  data?: any;
  read?: boolean | number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;

    static get relationMappings() {
    return {
      NotificationForUser: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'portal_notifications.user',
          to: 'user.id',
        },
      },
      NotificationByUser: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'portal_notifications.createdBy',
          to: 'user.id',
        },
      },
      NotificationByCorporate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Corporate,
        join: {
          from: 'portal_notifications.corporateId',
          to: 'corporates.id',
        },
      },
    };
  }
}
