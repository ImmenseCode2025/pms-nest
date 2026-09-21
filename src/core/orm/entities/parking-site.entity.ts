import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { FOC } from './foc.entity';
import { ParkingShiftClosing } from './parking-shift-closing.entity';
import { ParkingBlock } from './parking-block.entity';
import { Address } from './address.entity';
import { Company } from './company.entity';
import { ParkingToken } from './parking-token.entity';
import { Reservation } from './reservation.entity';
import { ParkingPrice } from './parking-price.entity';
import { Discount } from './discount.entity';
import { ParkingPriceLogs } from './parking-price-logs.entity';
import { ETAGLOGS } from './etaglogs.entity';
import { ScratchCardsHistory } from './scratch-cards-history.entity';
import { CompanyCards } from './company-cards.entity';
import { AppQrCode } from './app-qr-code.entity';
import { CompanyQrCode } from './company-qr-code.entity';
import { FocQrCode } from './foc-qr-code.entity';
import { CashQrCode } from './cash-qr-code.entity';
import { PosQrCode } from './pos-qr-code.entity';

export class ParkingSite extends Mapping {
    static get tableName() {
    return 'parking_site';
  }

  name?: string;
  siteCode?: string;
  addressId?: number;
  status?: "pending" | "active" | "inactive" | "outOfService" | "blocked";
  userId?: number;
  area?: number;
  unitOfMeasure?: "square feet" | "square meter" | "kilometer";
  companyId?: number;
  isValetParkingAvailable?: boolean;
  collectionPoint?: boolean;
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
      parkingSiteParkingBlocks: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingBlock,
        join: {
          from: 'parking_site.id',
          to: 'parking_block.site',
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
      siteParkingAddresses: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'parking_site.address',
          to: 'address.id',
        },
      },
      siteParkingCompany: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: 'parking_site.company',
          to: 'company.id',
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
      siteReservations: {
        relation: Mapping.HasManyRelation,
        modelClass: Reservation,
        join: {
          from: 'parking_site.id',
          to: 'reservation.site',
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
      siteDiscounts: {
        relation: Mapping.HasManyRelation,
        modelClass: Discount,
        join: {
          from: 'parking_site.id',
          to: 'discount.site',
        },
      },
      siteParkingPriceLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPriceLogs,
        join: {
          from: 'parking_site.id',
          to: 'parking_price_logs.siteId',
        },
      },
      ParkingSitesEtagLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: ETAGLOGS,
        join: {
          from: 'parking_site.id',
          to: 'etag_logs.site',
        },
      },
      EventSiteScratchCard: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCardsHistory,
        join: {
          from: 'parking_site.id',
          to: 'scratch_cards_history.site_id',
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
