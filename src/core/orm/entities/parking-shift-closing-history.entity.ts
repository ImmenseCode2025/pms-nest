import { Mapping } from '../sql.model';

export class ParkingShiftClosingHistory extends Mapping {
    static get tableName() {
    return 'parking_shift_closing_history';
  }

  shiftClosingId?: number;
  parkingSiteId?: number;
  shiftDate?: Date | string;
  shiftTime?: Date | string;
  shiftType?: "Morning Shift" | "Evening Shift";
  userId?: number;
  supervisorId?: number;
  shiftClosingFor?: "Handheld" | "System";
  deviceId?: number;
  operatorSignature?: string;
  supervisorSignature?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
