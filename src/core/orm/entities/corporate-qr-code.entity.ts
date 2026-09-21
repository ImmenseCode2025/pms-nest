import { Mapping } from '../sql.model';
import { CorporateCards } from './corporate-cards.entity';
import { Hardware } from './hardware.entity';

export class CorporateQrCode extends Mapping {
    static get tableName() {
    return 'corporate_qr_code';
  }

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
    return {
      corporateQrCorporateCard: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: CorporateCards,
        join: {
          from: 'corporate_qr_code.corporateCardId',
          to: 'corporate_cards.id',
        },
      },
      corporateQrHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'corporate_qr_code.hardware',
          to: 'hardware.id',
        },
      },
    };
  }
}
