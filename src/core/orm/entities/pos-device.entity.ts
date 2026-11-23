import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';

export class PosDevice extends Mapping {
  static get tableName() {
    return 'pos_device';
  }

  id?: number;
  serial_number?: string;
  bank?: string;
  site_id?: number;
  created_at?: Date | string;
  updated_at?: Date | string;

  site?: ParkingSite;

  static get relationMappings() {
    return {
      site: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        modify(query) {
          query.select('id', 'name');
        },
        join: {
          from: 'pos_device.site_id',
          to: 'parking_site.id',
        },
      },
    };
  }
}
