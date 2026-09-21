import { Mapping } from '../sql.model';
import { Hardware } from './hardware.entity';
import { Users } from './users.entity';

export class HardwareAssignLogs extends Mapping {
    static get tableName() {
    return 'hardware_assign_logs';
  }

  hardwareId?: number;
  assigneeId?: number;
  userId?: number;
  assignTo?: string;
  description?: string;
  assignedUser?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      assignLogsHardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'hardware_assign_logs.hardware',
          to: 'hardware.id',
        },
      },
      assignLogsUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'hardware_assign_logs.user',
          to: 'user.id',
        },
      },
      hardwareLogsAssignedUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'hardware_assign_logs.assignedUser',
          to: 'user.id',
        },
      },
    };
  }
}
