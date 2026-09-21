import { Mapping } from 'src/core/orm/sql.model';

export class ETAG extends Mapping {
  static table = 'etag';

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
    return {};
  }
}
