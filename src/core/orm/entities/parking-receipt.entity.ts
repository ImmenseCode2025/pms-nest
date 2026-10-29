import { Mapping } from '../sql.model';
import { Hardware } from './hardware.entity';
import { VehicleType } from './vehicle-type.entity';

export class ParkingReceipt extends Mapping {
  static get tableName() {
    return 'parking_receipt';
  }

  id?: number;
  vehicleNumber?: string;
  creationDate?: Date | string;
  deviceId?: string;
  uploadDate?: Date | string;
  vehicleType?: number;
  updatedAt?: Date | string;
  paymentMethod?: number;
  ticketNumber?: string;
  sourceHandheld?: number;
  sourceTicketEase?: number;
  checkoutDateTime?: Date | string;
  paymentReference?: string;
  onlinePaymentReference?: string;
  siteId?: number;
  checkInOperatorId?: number;
  checkOutOperatorId?: number;

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
      hardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'parking_receipt.deviceId',
          to: 'hardware.ipOrApi',
        },
      },
    };
  }
}
