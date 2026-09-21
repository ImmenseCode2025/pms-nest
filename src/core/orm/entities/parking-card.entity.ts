import { Mapping } from 'src/core/orm/sql.model';

export class ParkingCard extends Mapping {
  static table = 'parking_card';

  customerId?: number;
  credit?: string;
  purchaseDateTime?: Date | string;
  parkingBlockId?: number;
  paymentId?: number;
  cardStatus?: "activated" | "deactivated" | "pending" | "reactivated";
  validity?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
