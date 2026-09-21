import { Mapping } from 'src/core/orm/sql.model';

export class ETAGLOGS extends Mapping {
  static table = 'etag_logs';

  etagId?: number;
  entryTime?: Date | string;
  exitTime?: Date | string;
  paymentId?: number;
  parkingSiteId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
