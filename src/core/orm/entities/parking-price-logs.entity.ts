import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingSite } from './parking-site.entity';
import { VehicleType } from './vehicle-type.entity';

export class ParkingPriceLogs extends Mapping {
    static get tableName() {
    return 'parking_price_logs';
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
      logsUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_price_logs.user',
          to: 'user.id',
        },
      },
      logsParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'parking_price_logs.siteId',
          to: 'parking_site.id',
        },
      },
      logsVehicleTypes: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'parking_price_logs.vehicleType',
          to: 'vehicle_type.id',
        },
      },
    };
  }
}
