import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingSite } from './parking-site.entity';
import { VehicleType } from './vehicle-type.entity';

export class Discount extends Mapping {
    static get tableName() {
    return 'discount';
  }

  parkingSiteId?: number;
  vehicleTypeId?: number;
  percentageDiscount?: number;
  startDate?: Date | string;
  validity?: Date | string;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      discountUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'discount.user',
          to: 'user.id',
        },
      },
      discountParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'discount.site',
          to: 'parking_site.id',
        },
      },
      discountVehicleTypes: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'discount.vehicleType',
          to: 'vehicle_type.id',
        },
      },
    };
  }
}
