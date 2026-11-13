import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';

export class SiteConnectivity extends Mapping {
  static get tableName() {
    return 'site_connectivity';
  }

  static get idColumn() {
    return 'site_id';
  }

  site_id?: number;
  status?: 'online' | 'offline';
  connected_at?: Date | string;
  disconnected_at?: Date | string;
  last_seen_at?: Date | string;
  updated_at?: Date | string;

  site?: ParkingSite;

  static get relationMappings() {
    return {
      site: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'site_connectivity.site_id',
          to: 'parking_site.id',
        },
      },
    };
  }
}
