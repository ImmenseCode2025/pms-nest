import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';
import { Hardware } from './hardware.entity';
import { FOC } from './foc.entity';

export class CashQrCode extends Mapping {
    static get tableName() {
    return 'cash_qr_code';
  }

  id?: number;
  employeeId?: string;
  site?: number;
  hardware?: number;
  createdDateTime?: Date | string;
  tokenNumber?: string;

    static get relationMappings() {
    return {
      cashQrParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'cash_qr_code.site',
          to: 'parking_site.id',
        },
      },
      cashQrHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'cash_qr_code.hardware',
          to: 'hardware.id',
        },
      },
      cashQrCardFOC: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: FOC,
        join: {
          from: 'cash_qr_code.employeeId',
          to: 'foc_card.id',
        },
      },
    };
  }
}
