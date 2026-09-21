import { Mapping } from 'src/core/orm/sql.model';

export class CompanyCards extends Mapping {
  static table = 'company_cards';

  parkingSiteId?: number;
  employeeName?: string;
  vehicleNumber?: string;
  companyName?: string;
  designationId?: number;
  shiftTimeFrom?: Date | string;
  shiftTimeTo?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
