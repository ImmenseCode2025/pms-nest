import { Mapping } from 'src/core/orm/sql.model';

export class ParkingShiftClosing extends Mapping {
  static table = 'parking_shift_closing';

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
    return {};
  }
}
