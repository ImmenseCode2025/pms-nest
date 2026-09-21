import { Mapping } from 'src/core/orm/sql.model';

export class Discount extends Mapping {
  static table = 'discount';

  parkingSiteId?: number;
  vehicleTypeId?: number;
  percentageDiscount?: number;
  startDate?: Date | string;
  validity?: Date | string;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
