import { Mapping } from '../sql.model';
import { ETAGLOGS } from './etaglogs.entity';

export class ETAG extends Mapping {
    static get tableName() {
    return 'etag';
  }

  tagNumber?: string;
  userId?: number;
  vehicleTypeId?: number;
  customerId?: number;
  vehicleNumber?: string;
  statusEtag?: "pending" | "accepted" | "rejected" | "active" | "inactive" | "suspended" | "blacklisted";
  collectionPoint?: number;
  daysToCollect?: number;
  issuedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      etagLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: ETAGLOGS,
        join: {
          from: 'etag.id',
          to: 'etag_logs.etag',
        },
      },
    };
  }
}
