import { Mapping } from 'src/core/orm/sql.model';

export class ParkingLot extends Mapping {
  static table = 'parking_lot';

  name?: string;
  siteCode?: string;
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  parkingBlockFloorId?: number;
  longitude?: number;
  latitude?: number;
  availability?: "occupied" | "unoccupied";
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
