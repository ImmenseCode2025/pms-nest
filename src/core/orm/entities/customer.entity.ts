import { Mapping } from '../sql.model';
import { Address } from './address.entity';
import { Wallet } from './wallet.entity';
import { Payment } from './payment.entity';
import { CustomerAccessToken } from './customer-access-token.entity';
import { CustomerResetPassword } from './customer-reset-password.entity';
import { Notifications } from './notifications.entity';
import { AppQrCode } from './app-qr-code.entity';
import { CorporateCards } from './corporate-cards.entity';

export class Customer extends Mapping {
    static get tableName() {
    return 'customer';
  }

  id?: number;
  username?: string;
  password?: string;
  email?: string;
  contact?: string;
  cnic?: string;
  address?: number;
  profile?: string;
  status?: 'incomplete' | 'completed' | 'block' | 'deleted';
  creationDateTime?: Date | string;
  platform?: 'Smart Parking' | 'Parking Website' | 'Islamabad App';
  fullAddress?: string;
  updatedAt?: Date | string;
  creationSource?: 'google' | 'microsoft' | 'facebook' | 'manual' | 'apple';

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
      customerPayments: {
        relation: Mapping.HasManyRelation,
        modelClass: Payment,
        join: {
          from: 'customer.id',
          to: 'payment.customer',
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
      customerResetPasswords: {
        relation: Mapping.HasManyRelation,
        modelClass: CustomerResetPassword,
        join: {
          from: 'customer.id',
          to: 'customer_reset_password_otp.customer',
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
