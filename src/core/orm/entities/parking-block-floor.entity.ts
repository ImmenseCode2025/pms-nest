import { Mapping } from 'src/core/orm/sql.model';

export class ParkingBlockFloor extends Mapping {
  static table = 'parking_block_floor';

  name?: string;
  siteCode?: string;
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  parkingBlockId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
