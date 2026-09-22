import { Mapping } from '../sql.model';
import { ParkingSite } from './parking-site.entity';
import { Users } from './users.entity';
import { VehicleType } from './vehicle-type.entity';

export class ParkingPrice extends Mapping {
    static get tableName() {
    return 'parking_price';
  }

  vehicleTypeId?: number;
  amount?: number;
  defaultHour?: number;
  additionalCharges?: number;
  additionalChargesType?: "hourly" | "minutes" | "daily";
  userId?: number;
  parkingSiteId?: number;
  additionalChargesCategoryCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      price_vehicle_type: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'parking_price.vehicleType',
          to: 'vehicle_type.id',
        },
      },
      priceUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_price.user',
          to: 'user.id',
        },
      },
      priceParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'parking_price.siteId',
          to: 'parking_site.id',
        },
      },
    };
  }
}
