import { Mapping } from 'src/core/orm/sql.model';

export class ParkingReceiptOfflineLog extends Mapping {
  static table = 'parking_receipt_offline_data_logs';

  deviceId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
