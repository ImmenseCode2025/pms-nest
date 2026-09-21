import { Mapping } from 'src/core/orm/sql.model';

export class Hardware extends Mapping {
  static table = 'hardware';

  partName?: string;
  description?: string;
  configuration?: string;
  type?: "camera" | "barrier" | "license plate recognizer" | "personal computer" | "handheld" | "pos";
  status?: "active" | "inactive" | "outOfService" | "maintenance";
  userId?: number;
  assignedTo?: "parking site" | "parking gate" | "parking lot" | "hardware" | "parking block" | "parking floor";
  asignee?: number;
  assignedUser?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  uniqueId?: string;

  static get relationMappings() {
    return {};
  }
}
