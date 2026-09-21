import { Mapping } from 'src/core/orm/sql.model';

export class ParkingPriceLogs extends Mapping {
  static table = 'parking_price_logs';

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
    return {};
  }
}
