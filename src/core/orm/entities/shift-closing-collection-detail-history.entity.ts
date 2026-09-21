import { Mapping } from 'src/core/orm/sql.model';

export class ShiftClosingCollectionDetailHistory extends Mapping {
  static table = 'shift_closing_collection_history';

  shiftClosingId?: number;
  vehicleType?: number;
  paidVehicles?: number;
  focVehicles?: number;
  totalAmount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
