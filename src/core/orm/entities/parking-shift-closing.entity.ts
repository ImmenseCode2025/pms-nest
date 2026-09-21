import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingSite } from './parking-site.entity';
import { Hardware } from './hardware.entity';
import { ShiftClosingCollectionDetail } from './shift-closing-collection-detail.entity';
import { ShiftClosingPaymentMethod } from './shift-closing-payment-method.entity';

export class ParkingShiftClosing extends Mapping {
    static get tableName() {
    return 'parking_shift_closing';
  }

  parkingSiteId?: number;
  shiftDate?: Date | string;
  shiftTime?: Date | string;
  shiftType?: "Morning Shift" | "Evening Shift";
  userId?: number;
  supervisorId?: number;
  shiftClosingFor?: "Handheld" | "System";
  deviceId?: number;
  editRequest?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  discrepancy?: string;

    static get relationMappings() {
    return {
      shiftClosingUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_shift_closing.user',
          to: 'user.id',
        },
      },
      shiftClosingSupervisors: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_shift_closing.supervisor',
          to: 'user.id',
        },
      },
      shiftClosingParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'parking_shift_closing.site',
          to: 'parking_site.id',
        },
      },
      shiftClosingHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'parking_shift_closing.deviceId',
          to: 'hardware.id',
        },
      },
      parkingShiftClosingCollectionDetails: {
        relation: Mapping.HasManyRelation,
        modelClass: ShiftClosingCollectionDetail,
        join: {
          from: 'parking_shift_closing.id',
          to: 'shift_closing_collection.shiftClosing',
        },
      },
      parkingShiftClosingPaymentMethods: {
        relation: Mapping.HasManyRelation,
        modelClass: ShiftClosingPaymentMethod,
        join: {
          from: 'parking_shift_closing.id',
          to: 'shift_closing_payment_method.shiftClosing',
        },
      },
    };
  }
}
