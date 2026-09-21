import { Mapping } from '../sql.model';
import { Customer } from './customer.entity';
import { ParkingBlock } from './parking-block.entity';
import { Payment } from './payment.entity';
import { ReactivateParkingCard } from './reactivate-parking-card.entity';

export class ParkingCard extends Mapping {
    static get tableName() {
    return 'parking_card';
  }

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
    return {
      cardCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'parking_card.customer',
          to: 'customer.id',
        },
      },
      cardParkingBlock: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingBlock,
        join: {
          from: 'parking_card.parkingBlock',
          to: 'parking_block.id',
        },
      },
      cardPayment: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Payment,
        join: {
          from: 'parking_card.payment',
          to: 'payment.id',
        },
      },
      reactivationCard: {
        relation: Mapping.HasManyRelation,
        modelClass: ReactivateParkingCard,
        join: {
          from: 'parking_card.id',
          to: 'reactivate_parking_card.parkingCard',
        },
      },
    };
  }
}
