import { Mapping } from '../sql.model';
import { Address } from './address.entity';
import { Wallet } from './wallet.entity';
import { EasyPaisa } from './easy-paisa.entity';
import { JazzCash } from './jazz-cash.entity';
import { Payment } from './payment.entity';
import { Reservation } from './reservation.entity';
import { CustomerAccessToken } from './customer-access-token.entity';
import { BankCard } from './bank-card.entity';
import { ParkingCard } from './parking-card.entity';
import { CustomerResetPassword } from './customer-reset-password.entity';
import { ScratchCard } from './scratch-card.entity';
import { Notifications } from './notifications.entity';
import { AppQrCode } from './app-qr-code.entity';
import { CorporateCards } from './corporate-cards.entity';

export class Customer extends Mapping {
    static get tableName() {
    return 'customer';
  }

  email?: string;
  username?: string;
  password?: string;
  contact?: string;
  cnic?: string;
  addressId?: number;
  profilePic?: string;
  statusProfile?: "incomplete" | "completed" | "block" | "deleted";
  creationSource?: "google" | "microsoft" | "facebook" | "manual" | "apple";
  platform?: "Smart Parking" | "Parking Website" | "Islamabad App";
  fullAddress?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      customerAddresses: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'customer.address',
          to: 'address.id',
        },
      },
      customerWallet: {
        relation: Mapping.HasManyRelation,
        modelClass: Wallet,
        join: {
          from: 'customer.id',
          to: 'wallet.customer',
        },
      },
      customerEasyPaisa: {
        relation: Mapping.HasManyRelation,
        modelClass: EasyPaisa,
        join: {
          from: 'customer.id',
          to: 'easypaisa.customer',
        },
      },
      customerJazzCash: {
        relation: Mapping.HasManyRelation,
        modelClass: JazzCash,
        join: {
          from: 'customer.id',
          to: 'jazzcash.customer',
        },
      },
      customerPayments: {
        relation: Mapping.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'customer.id',
          to: 'payment.customer',
        },
      },
      customerReservations: {
        relation: Mapping.HasManyRelation,
        modelClass: Reservation,
        join: {
          from: 'customer.id',
          to: 'reservation.customer',
        },
      },
      customerCustomerAccessToken: {
        relation: Mapping.HasManyRelation,
        modelClass: CustomerAccessToken,
        join: {
          from: 'customer.id',
          to: 'customer_access_token.customer',
        },
      },
      customerBankCards: {
        relation: Mapping.HasManyRelation,
        modelClass: BankCard,
        join: {
          from: 'customer.id',
          to: 'bank_card.customer',
        },
      },
      customerParkingCards: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingCard,
        join: {
          from: 'customer.id',
          to: 'parking_card.customer',
        },
      },
      customerResetPasswords: {
        relation: Mapping.HasManyRelation,
        modelClass: CustomerResetPassword,
        join: {
          from: 'customer.id',
          to: 'customer_reset_password_otp.customer',
        },
      },
      customerScratchCards: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCard,
        join: {
          from: 'customer.id',
          to: 'scratch_card.customer',
        },
      },
      customerNotifications: {
        relation: Mapping.HasManyRelation,
        modelClass: Notifications,
        join: {
          from: 'customer.id',
          to: 'notification.customer',
        },
      },
      customerAppQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: AppQrCode,
        join: {
          from: 'customer.id',
          to: 'app_qr_code.customer',
        },
      },
      customerCorporateCards: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateCards,
        join: {
          from: 'customer.id',
          to: 'corporate_cards.customer',
        },
      },
    };
  }
}
