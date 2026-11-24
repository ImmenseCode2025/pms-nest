import { Mapping } from '../sql.model';

export class ParkingReceiptOfflineLog extends Mapping {
    static get tableName() {
    return 'parking_receipt_offline_data_logs';
  }

  id?: number;
  deviceId?: string;
  creationDate?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
