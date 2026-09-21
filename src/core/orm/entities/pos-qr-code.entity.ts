import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingSite } from './parking-site.entity';
import { Hardware } from './hardware.entity';

export class PosQrCode extends Mapping {
    static get tableName() {
    return 'pos_qr_code';
  }

  id?: number;
  user?: number;
  name?: string;
  deviceId?: string;
  site?: number;
  hardware?: number;
  createdDateTime?: Date | string;
  tokenNumber?: string;

    static get relationMappings() {
    return {
      posQrUser: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'pos_qr_code.user',
          to: 'user.id',
        },
      },
      posQrParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'pos_qr_code.site',
          to: 'parking_site.id',
        },
      },
      posQrHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'pos_qr_code.hardware',
          to: 'hardware.id',
        },
      },
    };
  }
}
