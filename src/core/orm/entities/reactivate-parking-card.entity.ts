import { Mapping } from '../sql.model';
import { ParkingCard } from './parking-card.entity';
import { Payment } from './payment.entity';

export class ReactivateParkingCard extends Mapping {
    static get tableName() {
    return 'reactivate_parking_card';
  }

  parkingCardId?: number;
  reactivatedDate?: Date | string;
  paymentId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      cardToReactivate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingCard,
        join: {
          from: 'reactivate_parking_card.parkingCard',
          to: 'parking_card.id',
        },
      },
      cardPayment: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Payment,
        join: {
          from: 'reactivate_parking_card.payment',
          to: 'payment.id',
        },
      },
    };
  }
}
