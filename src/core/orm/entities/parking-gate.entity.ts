import { Mapping } from 'src/core/orm/sql.model';

export class ParkingGate extends Mapping {
  static table = 'parking_gate';

  name?: string;
  siteCode?: string;
  parkingBlockId?: number;
  userId?: number;
  addressId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
