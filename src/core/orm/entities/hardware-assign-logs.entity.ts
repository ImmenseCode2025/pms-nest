import { Mapping } from '../sql.model';
import { Hardware } from './hardware.entity';
import { Users } from './users.entity';

export class HardwareAssignLogs extends Mapping {
    static get tableName() {
    return 'hardware_assign_logs';
  }

  id?: number;
  hardware?: number;
  assignee?: number;
  assignDate?: Date | string;
  user?: number;
  assignTo?: string;
  description?: string;
  updatedAt?: Date | string;
  assignedUser?: number;

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
