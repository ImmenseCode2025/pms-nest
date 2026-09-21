import { Mapping } from 'src/core/orm/sql.model';

export class ParkingBlock extends Mapping {
  static table = 'parking_block';

  name?: string;
  siteCode?: string;
  addressId?: number;
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  parkingSiteId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
