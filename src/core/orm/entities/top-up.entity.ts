import { Mapping } from '../sql.model';
import { Wallet } from './wallet.entity';
import { Payment } from './payment.entity';

export class TopUp extends Mapping {
    static get tableName() {
    return 'topup';
  }

  walletId?: number;
  quantity?: number;
  paymentId?: number;
  transactionDateTime?: Date | string;
  receiptNumber?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      topUpWallets: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Wallet,
        join: {
          from: 'topup.wallet',
          to: 'wallet.id',
        },
      },
      topUpPayments: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Payment,
        join: {
          from: 'topup.payment',
          to: 'payment.id',
        },
      },
    };
  }
}
