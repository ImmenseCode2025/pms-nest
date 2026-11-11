import { Mapping } from '../sql.model';

export class ParkingShiftClosingHistory extends Mapping {
    static get tableName() {
    return 'parking_shift_closing_history';
  }

  id?: number;
  site?: number;
  shiftDate?: Date | string;
  shiftTime?: string;
  shiftType?: 'Morning Shift' | 'Evening Shift';
  user?: number;
  supervisor?: number;
  shiftClosingFor?: 'Handheld' | 'System';
  deviceId?: number;
  operatorSignature?: string;
  supervisorSignature?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  shiftClosingId?: number;

  static get relationMappings() {
    return {};
  }
}
