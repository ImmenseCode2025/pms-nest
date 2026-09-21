import { Mapping } from '../sql.model';

export class ShiftClosingPaymentMethodHistory extends Mapping {
    static get tableName() {
    return 'shift_closing_payment_method_history';
  }

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
