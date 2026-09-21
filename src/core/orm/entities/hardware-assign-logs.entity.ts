import { Mapping } from 'src/core/orm/sql.model';

export class HardwareAssignLogs extends Mapping {
  static table = 'hardware_assign_logs';

  hardwareId?: number;
  assigneeId?: number;
  userId?: number;
  assignTo?: string;
  description?: string;
  assignedUser?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
