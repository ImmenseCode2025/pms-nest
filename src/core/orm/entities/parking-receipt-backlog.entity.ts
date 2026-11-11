import { Mapping } from '../sql.model';

export class ParkingReceiptBacklog extends Mapping {
    static get tableName() {
    return 'parking_receipt_backlog';
  }

  id?: number;
  vehicleNumber?: string;
  creationDate?: Date | string;
  deviceId?: string;
  uploadDate?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
