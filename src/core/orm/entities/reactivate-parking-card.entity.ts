import { Mapping } from 'src/core/orm/sql.model';

export class ReactivateParkingCard extends Mapping {
  static table = 'reactivate_parking_card';

  parkingCardId?: number;
  reactivatedDate?: Date | string;
  paymentId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
