import { Mapping } from 'src/core/orm/sql.model';

export class AppQrCode extends Mapping {
  static table = 'app_qr_code';

  id?: number;
  tokenNumber?: string;
  site?: number;
  paymentStatus?: string;
  customer?: number;
  status?: string;
  hardware?: number;
  createdDateTime?: Date | string;

  static get relationMappings() {
    return {};
  }
}
