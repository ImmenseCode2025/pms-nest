import { Mapping } from 'src/core/orm/sql.model';

export class FOC extends Mapping {
  static table = 'foc_card';

  parkingSiteId?: number;
  employeeId?: string;
  employeeName?: string;
  dateJoining?: Date | string;
  companyId?: number;
  designationId?: number;
  shiftTimeFrom?: Date | string;
  shiftTimeTo?: Date | string;
  profilePic?: string;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
