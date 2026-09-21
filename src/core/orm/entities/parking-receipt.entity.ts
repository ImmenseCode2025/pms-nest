import { Mapping } from '../sql.model';
import { VehicleType } from './vehicle-type.entity';

export class ParkingReceipt extends Mapping {
    static get tableName() {
    return 'parking_receipt';
  }

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
    return {
      receiptVehicleTypes: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'parking_receipt.vehicleType',
          to: 'vehicle_type.id',
        },
      },
    };
  }
}
