import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingGate } from './parking-gate.entity';

export class InstanceEntranceExit extends Mapping {
    static get tableName() {
    return 'instance_entrance_or_exit';
  }

  name?: string;
  siteCode?: string;
  parkingGateId?: number;
  type?: "entrance" | "exit";
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      instanceEntranceExitUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'instance_entrance_or_exit.user',
          to: 'user.id',
        },
      },
      instanceEntranceExitParkingGates: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingGate,
        join: {
          from: 'instance_entrance_or_exit.gate',
          to: 'parking_gate.id',
        },
      },
    };
  }
}
