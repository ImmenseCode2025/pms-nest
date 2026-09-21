import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';
import { Hardware } from './hardware.entity';

export class CompanyQrCode extends Mapping {
    static get tableName() {
    return 'company_qr_code';
  }

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
    return {
      companyQrParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'company_qr_code.site',
          to: 'parking_site.id',
        },
      },
      companyQrHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'company_qr_code.hardware',
          to: 'hardware.id',
        },
      },
    };
  }
}
