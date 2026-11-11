import { Mapping } from '../sql.model';
import { TopUp } from './top-up.entity';
import { Customer } from './customer.entity';
import { PaymentGateway } from './payment-gateway.entity';

export class Payment extends Mapping {
    static get tableName() {
    return 'payment';
  }

  id?: number;
  customer?: number;
  token?: number;
  amount?: number;
  transactionDateTime?: Date | string;
  status?: 'pending' | 'success' | 'failed';
  paymentGateway?: number;
  savePaymentInfo?: boolean | number;
  paidThroughSavedInfo?: boolean | number;
  invoice?: string;
  discount?: number;
  category?: 'parking' | 'topup' | 'parkingCard' | 'parkingFine' | 'scratchCard';
  longitude?: number;
  latitude?: number;
  orderId?: string;
  instanceId?: number;
  receiptNumber?: string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  company?: number;

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
    };
  }
}
