import { Mapping } from 'src/core/orm/sql.model';

export class ParkingToken extends Mapping {
  static table = 'parking_token';

  tokenNumber?: string;
  qrCode?: string;
  checkInDateTime?: Date | string;
  checkOutDateTime?: Date | string;
  parkingSiteId?: number;
  status?: "active" | "inactive" | "expired";
  hardwareId?: number;
  customerId?: number;
  parkingLotId?: number;
  vehicleTypeId?: number;
  vehicleNumber?: string;
  paymentMethod?: number;
  isExited?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
