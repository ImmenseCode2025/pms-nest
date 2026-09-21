import { Mapping } from '../sql.model';

export class ShiftClosingCollectionDetailHistory extends Mapping {
    static get tableName() {
    return 'shift_closing_collection_history';
  }

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
