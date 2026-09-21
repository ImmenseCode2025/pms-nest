import { Mapping } from '../sql.model';
import { ShiftClosingCollectionDetail } from './shift-closing-collection-detail.entity';
import { ParkingToken } from './parking-token.entity';
import { Users } from './users.entity';
import { ParkingPrice } from './parking-price.entity';
import { Discount } from './discount.entity';
import { ParkingPriceLogs } from './parking-price-logs.entity';
import { ParkingReceipt } from './parking-receipt.entity';
import { CorporateCards } from './corporate-cards.entity';

export class VehicleType extends Mapping {
    static get tableName() {
    return 'vehicle_type';
  }

  name?: string;
  userId?: number;
  registerDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      vehicleTypeShiftClosingCollectionDetails: {
        relation: Mapping.HasManyRelation,
        modelClass: ShiftClosingCollectionDetail,
        join: {
          from: 'vehicle_type.id',
          to: 'shift_closing_collection.vehicleType',
        },
      },
      typeParkingTokens: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingToken,
        join: {
          from: 'vehicle_type.id',
          to: 'parking_token.vehicleType',
        },
      },
      typeUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'vehicle_type.user',
          to: 'user.id',
        },
      },
      typeParkingPrices: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPrice,
        join: {
          from: 'vehicle_type.id',
          to: 'parking_price.vehicleType',
        },
      },
      typeDiscounts: {
        relation: Mapping.HasManyRelation,
        modelClass: Discount,
        join: {
          from: 'vehicle_type.id',
          to: 'discount.vehicleType',
        },
      },
      typeParkingPriceLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPriceLogs,
        join: {
          from: 'vehicle_type.id',
          to: 'parking_price_logs.vehicleType',
        },
      },
      typeParkingReceipts: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingReceipt,
        join: {
          from: 'vehicle_type.id',
          to: 'parking_receipt.vehicleType',
        },
      },
      vehicleTypeCorporateCards: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateCards,
        join: {
          from: 'vehicle_type.id',
          to: 'corporate_cards.vehicleType',
        },
      },
    };
  }
}
