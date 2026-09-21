import { Mapping } from 'src/core/orm/sql.model';

export class ParkingReceiptBacklog extends Mapping {
  static table = 'parking_receipt_backlog';

  vehicleNumber?: string;
  deviceId?: string;
  uploadDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
