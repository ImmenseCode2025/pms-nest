import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';
import { Users } from './users.entity';

export class Operator extends Mapping {
  static get tableName() {
    return 'operators';
  }

  id?: number;
  username?: string;
  mobile?: string;
  email?: string;
  cnic?: string;
  site_id?: number;
  supervisor_id?: number;
  password?: string;
  profile_image?: string;
  status?: string;
  created_at?: Date | string;
  updated_at?: Date | string;

  static get relationMappings() {
    return {
      site: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'operators.site_id',
          to: 'parking_site.id',
        },
      },
      supervisor: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'operators.supervisor_id',
          to: 'user.id',
        },
      },
    };
  }
}
