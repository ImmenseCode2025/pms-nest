import { Mapping } from 'src/core/orm/sql.model';

export class CompanyQrCode extends Mapping {
  static table = 'company_qr_code';

  id?: number;
  companyName?: string;
  employeeName?: string;
  deviceId?: string;
  site?: number;
  hardware?: number;
  createdDateTime?: Date | string;
  tokenNumber?: string;
  vehicleNumber?: string;

  static get relationMappings() {
    return {};
  }
}
