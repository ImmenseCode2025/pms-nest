import { Mapping } from 'src/core/orm/sql.model';

export class InstanceEntranceExit extends Mapping {
  static table = 'instance_entrance_or_exit';

  name?: string;
  siteCode?: string;
  parkingGateId?: number;
  type?: "entrance" | "exit";
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
