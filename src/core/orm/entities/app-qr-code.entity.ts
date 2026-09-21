import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';
import { Customer } from './customer.entity';
import { Hardware } from './hardware.entity';

export class AppQrCode extends Mapping {
    static get tableName() {
    return 'app_qr_code';
  }

  id?: number;
  tokenNumber?: string;
  site?: number;
  paymentStatus?: string;
  customer?: number;
  status?: string;
  hardware?: number;
  createdDateTime?: Date | string;

    static get relationMappings() {
    return {
      appQrParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'app_qr_code.site',
          to: 'parking_site.id',
        },
      },
      appQrCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'app_qr_code.customer',
          to: 'customer.id',
        },
      },
      appQrHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'app_qr_code.hardware',
          to: 'hardware.id',
        },
      },
    };
  }
}
