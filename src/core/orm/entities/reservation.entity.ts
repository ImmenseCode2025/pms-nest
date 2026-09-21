import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';
import { ParkingToken } from './parking-token.entity';
import { ParkingSite } from './parking-site.entity';

export class Reservation extends Mapping {
    static get tableName() {
    return 'reservation';
  }

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
    return {
      reservationCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'reservation.customer',
          to: 'customer.id',
        },
      },
      reservationParkingToken: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingToken,
        join: {
          from: 'reservation.token',
          to: 'parking_token.id',
        },
      },
      reservationParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'reservation.site',
          to: 'parking_site.id',
        },
      },
    };
  }
}
