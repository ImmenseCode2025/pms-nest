import { Mapping } from '../sql.model';
import { ParkingShiftClosing } from './parking-shift-closing.entity';
import { VehicleType } from './vehicle-type.entity';

export class ShiftClosingCollectionDetail extends Mapping {
    static get tableName() {
    return 'shift_closing_collection';
  }

  shiftClosingId?: number;
  vehicleType?: number;
  paidVehicles?: number;
  focVehicles?: number;
  totalAmount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      shiftClosingCollectionDetails: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingShiftClosing,
        join: {
          from: 'shift_closing_collection.shiftClosing',
          to: 'parking_shift_closing.id',
        },
      },
      shiftClosingCollectionDetailsVehicleTypes: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'shift_closing_collection.vehicleType',
          to: 'vehicle_type.id',
        },
      },
    };
  }
}
