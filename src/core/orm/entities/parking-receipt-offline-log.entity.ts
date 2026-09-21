import { Mapping } from '../sql.model';

export class ParkingReceiptOfflineLog extends Mapping {
    static get tableName() {
    return 'parking_receipt_offline_data_logs';
  }

  deviceId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
