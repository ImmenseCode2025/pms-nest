import { Mapping } from 'src/core/orm/sql.model';

export class CorporateQrCode extends Mapping {
  static table = 'corporate_qr_code';

  id?: number;
  companyName?: string;
  deviceId?: string;
  hardware?: number;
  createdDateTime?: Date | string;
  tokenNumber?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  corporateCardId?: number;

  static get relationMappings() {
    return {};
  }
}
