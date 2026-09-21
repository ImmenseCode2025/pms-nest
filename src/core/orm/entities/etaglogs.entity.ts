import { Mapping } from '../sql.model';
import { ETAG } from './etag.entity';
import { ParkingSite } from './parking-site.entity';

export class ETAGLOGS extends Mapping {
    static get tableName() {
    return 'etag_logs';
  }

  etagId?: number;
  entryTime?: Date | string;
  exitTime?: Date | string;
  paymentId?: number;
  parkingSiteId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      logsETAGs: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ETAG,
        join: {
          from: 'etag_logs.etag',
          to: 'etag.id',
        },
      },
      etagLogsParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'etag_logs.site',
          to: 'parking_site.id',
        },
      },
    };
  }
}
