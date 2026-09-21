import { Mapping } from 'src/core/orm/sql.model';

export class PosQrCode extends Mapping {
  static table = 'pos_qr_code';

  id?: number;
  user?: number;
  name?: string;
  deviceId?: string;
  site?: number;
  hardware?: number;
  createdDateTime?: Date | string;
  tokenNumber?: string;

  static get relationMappings() {
    return {};
  }
}
