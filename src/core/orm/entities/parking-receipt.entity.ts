import { Mapping } from 'src/core/orm/sql.model';

export class ParkingReceipt extends Mapping {
  static table = 'parking_receipt';

  vehicleNumber?: string;
  deviceId?: string;
  uploadDate?: Date | string;
  vehicleTypeId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  paymentMethod?: number;
  onlinePaymentReference?: string;
  ticketNumber?: string;

  static get relationMappings() {
    return {};
  }
}
