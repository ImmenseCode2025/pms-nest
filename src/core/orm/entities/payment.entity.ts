import { Mapping } from 'src/core/orm/sql.model';

export class Payment extends Mapping {
  static table = 'payment';

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
    return {};
  }
}
