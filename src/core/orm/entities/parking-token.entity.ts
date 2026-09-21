import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';
import { Hardware } from './hardware.entity';
import { ParkingLot } from './parking-lot.entity';
import { VehicleType } from './vehicle-type.entity';
import { PaymentMethod } from './payment-method.entity';
import { Reservation } from './reservation.entity';
import { EntranceExitMonitor } from './entrance-exit-monitor.entity';

export class ParkingToken extends Mapping {
    static get tableName() {
    return 'parking_token';
  }

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
    return {
      tokenParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'parking_token.site',
          to: 'parking_site.id',
        },
      },
      tokenHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'parking_token.hardware',
          to: 'hardware.id',
        },
      },
      tokenParkingLot: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingLot,
        join: {
          from: 'parking_token.lot',
          to: 'parking_lot.id',
        },
      },
      tokenVehicleType: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'parking_token.vehicleType',
          to: 'vehicle_type.id',
        },
      },
      tokenPaymentMethod: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: PaymentMethod,
        join: {
          from: 'parking_token.paymentMethod',
          to: 'payment_method.id',
        },
      },
      tokenReservations: {
        relation: Mapping.HasManyRelation,
        modelClass: Reservation,
        join: {
          from: 'parking_token.id',
          to: 'reservation.token',
        },
      },
      tokenEntranceExitMonitor: {
        relation: Mapping.HasManyRelation,
        modelClass: EntranceExitMonitor,
        join: {
          from: 'parking_token.id',
          to: 'entrance_exit_monitor.token',
        },
      },
    };
  }
}
