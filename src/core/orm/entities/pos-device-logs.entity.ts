import { Mapping } from '../sql.model';
import { Users } from './users.entity';

export class PosDeviceLogs extends Mapping {
  static get tableName() {
    return 'pos_device_logs';
  }

  id?: number;
  pos_device_id?: number;
  user_id?: number;
  action?: 'created' | 'assigned' | 'updated' | 'deleted';
  field?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  created_at?: Date | string;
  updated_at?: Date | string;

  user?: Users;

  static get relationMappings() {
    return {
      user: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        modify(query) {
          query.select('id', 'username', 'email');
        },
        join: {
          from: 'pos_device_logs.user_id',
          to: 'user.id',
        },
      },
    };
  }
}
