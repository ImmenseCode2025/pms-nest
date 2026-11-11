import { Mapping } from '../sql.model';
import { ShiftClosingCollectionDetail } from './shift-closing-collection-detail.entity';
import { ParkingToken } from './parking-token.entity';
import { ParkingPrice } from './parking-price.entity';
import { ParkingReceipt } from './parking-receipt.entity';
import { CorporateCards } from './corporate-cards.entity';

export class VehicleType extends Mapping {
    static get tableName() {
    return 'vehicle_type';
  }

  id?: number;
  name?: string;
  registerDateTime?: Date | string;
  user?: number;
  updatedAt?: Date | string;
  createdAt?: Date | string;

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
      typeParkingPrices: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPrice,
        join: {
          from: 'vehicle_type.id',
          to: 'parking_price.vehicleType',
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
