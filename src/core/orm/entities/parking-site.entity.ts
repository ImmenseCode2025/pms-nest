import { Mapping } from 'src/core/orm/sql.model';

export class ParkingSite extends Mapping {
  static table = 'parking_site';

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
    return {};
  }
}
