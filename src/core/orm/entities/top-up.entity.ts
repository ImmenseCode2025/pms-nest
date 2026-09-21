import { Mapping } from 'src/core/orm/sql.model';

export class TopUp extends Mapping {
  static table = 'topup';

  walletId?: number;
  quantity?: number;
  paymentId?: number;
  transactionDateTime?: Date | string;
  receiptNumber?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
