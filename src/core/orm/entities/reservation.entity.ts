import { Mapping } from 'src/core/orm/sql.model';

export class Reservation extends Mapping {
  static table = 'reservation';

  customerId?: number;
  parkingSiteId?: number;
  parkingTokenId?: number;
  reservationDate?: Date | string;
  reservationTime?: Date | string;
  status?: "pending" | "checkIn" | "checkOut" | "canceled";
  reservationDateTime?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
