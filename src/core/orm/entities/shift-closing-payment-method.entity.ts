import { Mapping } from 'src/core/orm/sql.model';

export class ShiftClosingPaymentMethod extends Mapping {
  static table = 'shift_closing_payment_method';

  shiftClosingId?: number;
  paymentMethodType?: "Scratch Card" | "Credit/Debit Card" | "Parking Receipt" | "App & Others";
  paymentAmount?: number;
  numberOfVehicles?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
