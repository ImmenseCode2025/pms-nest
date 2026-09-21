import { Mapping } from 'src/core/orm/sql.model';

export class FocQrCode extends Mapping {
  static table = 'foc_qr_code';

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
