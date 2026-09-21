import { Mapping } from '../sql.model';
import { ParkingShiftClosing } from './parking-shift-closing.entity';

export class ShiftClosingPaymentMethod extends Mapping {
    static get tableName() {
    return 'shift_closing_payment_method';
  }

  shiftClosingId?: number;
  paymentMethodType?: "Scratch Card" | "Credit/Debit Card" | "Parking Receipt" | "App & Others";
  paymentAmount?: number;
  numberOfVehicles?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      shiftClosingPaymentMethods: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingShiftClosing,
        join: {
          from: 'shift_closing_payment_method.shiftClosing',
          to: 'parking_shift_closing.id',
        },
      },
    };
  }
}
