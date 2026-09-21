import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingToken } from './parking-token.entity';
import { Hardware } from './hardware.entity';

export class EntranceExitMonitor extends Mapping {
    static get tableName() {
    return 'entrance_exit_monitor';
  }

  userId?: number;
  parkingTokenId?: number;
  hardwareId?: number;
  screenShot?: string;
  registrationNo?: string;
  captureDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      monitorUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'entrance_exit_monitor.user',
          to: 'user.id',
        },
      },
      monitorParkingTokens: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingToken,
        join: {
          from: 'entrance_exit_monitor.token',
          to: 'parking_token.id',
        },
      },
      monitorHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'entrance_exit_monitor.hardware',
          to: 'hardware.id',
        },
      },
    };
  }
}
