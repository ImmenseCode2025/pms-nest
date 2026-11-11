import { Mapping } from '../sql.model';
import { AppQrCode } from './app-qr-code.entity';
import { CashQrCode } from './cash-qr-code.entity';
import { CompanyCards } from './company-cards.entity';
import { CompanyQrCode } from './company-qr-code.entity';
import { FocQrCode } from './foc-qr-code.entity';
import { FOC } from './foc.entity';
import { ParkingPrice } from './parking-price.entity';
import { ParkingShiftClosing } from './parking-shift-closing.entity';
import { ParkingToken } from './parking-token.entity';
import { PosQrCode } from './pos-qr-code.entity';
import { Users } from './users.entity';

export class ParkingSite extends Mapping {
  static get tableName() {
    return 'parking_site';
  }

  static withSiteEntryCounts(query: any, siteTable: string = 'parking_site') {
    return query.select(
      `${siteTable}.*`,
      Mapping.raw(
        `((SELECT COUNT(id) FROM parking_token WHERE parking_token.site = ${siteTable}.id) + (SELECT COUNT(pr.id) FROM parking_receipt pr INNER JOIN hardware hw ON pr.deviceId = hw.ipOrApi WHERE hw.asignee = ${siteTable}.id)) AS totalEntries`,
      ),
    );
  }

  id?: number;
  name?: string;
  sgi?: string;
  address?: number;
  status?: 'pending' | 'active' | 'inactive' | 'outOfService' | 'blocked';
  user?: number;
  area?: number;
  location?: string;
  latitude?: string;
  longitude?: string;
  company?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      usersAtParkingSite: {
        relation: Mapping.HasManyRelation,
        modelClass: Users,
        join: {
          from: 'parking_site.id',
          to: 'user.site',
        },
      },
      siteFOC: {
        relation: Mapping.HasManyRelation,
        modelClass: FOC,
        join: {
          from: 'parking_site.id',
          to: 'foc_card.site',
        },
      },
      siteShiftClosing: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingShiftClosing,
        join: {
          from: 'parking_site.id',
          to: 'parking_shift_closing.site',
        },
      },
      parkingSiteUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_site.user',
          to: 'user.id',
        },
      },
      siteParkingTokens: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingToken,
        join: {
          from: 'parking_site.id',
          to: 'parking_token.site',
        },
      },
      siteParkingPrices: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPrice,
        join: {
          from: 'parking_site.id',
          to: 'parking_price.siteId',
        },
      },
      siteCompanyCards: {
        relation: Mapping.HasManyRelation,
        modelClass: CompanyCards,
        join: {
          from: 'parking_site.id',
          to: 'company_cards.site',
        },
      },
      siteAppQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: AppQrCode,
        join: {
          from: 'parking_site.id',
          to: 'app_qr_code.site',
        },
      },
      siteCompanyQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: CompanyQrCode,
        join: {
          from: 'parking_site.id',
          to: 'company_qr_code.site',
        },
      },
      siteFocQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: FocQrCode,
        join: {
          from: 'parking_site.id',
          to: 'foc_qr_code.site',
        },
      },
      siteCashQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: CashQrCode,
        join: {
          from: 'parking_site.id',
          to: 'cash_qr_code.site',
        },
      },
      sitePosQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: PosQrCode,
        join: {
          from: 'parking_site.id',
          to: 'pos_qr_code.site',
        },
      },
    };
  }
}
