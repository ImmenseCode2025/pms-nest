import { Mapping } from '../sql.model';
import { TopUp } from './top-up.entity';
import { Customer } from './customer.entity';
import { PaymentGateway } from './payment-gateway.entity';
import { ParkingCard } from './parking-card.entity';
import { ReactivateParkingCard } from './reactivate-parking-card.entity';

export class Payment extends Mapping {
    static get tableName() {
    return 'payment';
  }

  customerId?: number;
  parkingTokenId?: number;
  amount?: number;
  transactionDateTime?: Date | string;
  status?: "pending" | "success" | "failed";
  paymentGatewayId?: number;
  savePaymentInfo?: boolean;
  paidThroughSavedInfo?: boolean;
  invoice?: string;
  discountID?: number;
  category?: "parking" | "topup" | "parkingCard" | "parkingFine" | "scratchCard";
  longitude?: number;
  latitude?: number;
  orderId?: string;
  instanceId?: number;
  receiptNumber?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      paymentTopUps: {
        relation: Mapping.HasManyRelation,
        modelClass: TopUp,
        join: {
          from: 'payment.id',
          to: 'topup.payment',
        },
      },
      paymentCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'payment.customer',
          to: 'customer.id',
        },
      },
      paymentPaymentGateway: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: PaymentGateway,
        join: {
          from: 'payment.paymentGateway',
          to: 'payment_gateway.id',
        },
      },
      paymentParkingCards: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingCard,
        join: {
          from: 'payment.id',
          to: 'parking_card.payment',
        },
      },
      paymentReactivationCard: {
        relation: Mapping.HasManyRelation,
        modelClass: ReactivateParkingCard,
        join: {
          from: 'payment.id',
          to: 'reactivate_parking_card.payment',
        },
      },
    };
  }
}
