import { Mapping } from 'src/core/orm/sql.model';

export class CashQrCode extends Mapping {
  static table = 'cash_qr_code';

  id?: number;
  employeeId?: string;
  site?: number;
  hardware?: number;
  createdDateTime?: Date | string;
  tokenNumber?: string;

  static get relationMappings() {
    return {};
  }
}
