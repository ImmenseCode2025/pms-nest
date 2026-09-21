import { Mapping } from 'src/core/orm/sql.model';

export class VehicleType extends Mapping {
  static table = 'vehicle_type';

  name?: string;
  userId?: number;
  registerDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
