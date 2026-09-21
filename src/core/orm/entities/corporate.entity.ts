import { Mapping } from '../sql.model';
import { CorporateResetPassword } from './corporate-reset-password.entity';
import { PortalNotification } from './portal-notification.entity';
import { Address } from './address.entity';
import { CorporateCards } from './corporate-cards.entity';
import { CorporateBillingPlan } from './corporate-billing-plan.entity';
import { CorporateInvoice } from './corporate-invoice.entity';

export class Corporate extends Mapping {
    static get tableName() {
    return 'corporates';
  }

  name?: string;
  registrationNumber?: string;
  email?: string;
  addressId?: number;
  location?: string;
  contactPersonName?: string;
  contactNumber?: string;
  password?: string;
  statusCorporate?: "pending" | "approved" | "rejected";
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      corporateResetPasswords: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateResetPassword,
        join: {
          from: 'corporates.id',
          to: 'corporate_reset_password_otp.corporate',
        },
      },
      CorporateNotifications: {
        relation: Mapping.HasManyRelation,
        modelClass: PortalNotification,
        join: {
          from: 'corporates.id',
          to: 'portal_notifications.corporateId',
        },
      },
      corporateAddresses: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'corporates.address',
          to: 'address.id',
        },
      },
      corporateCorporateCards: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateCards,
        join: {
          from: 'corporates.id',
          to: 'corporate_cards.corporate',
        },
      },
      billingPlans: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateBillingPlan,
        join: {
          from: 'corporates.id',
          to: 'corporate_billing_plans.corporateId',
        },
      },
      corporateInvoices: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateInvoice,
        join: {
          from: 'corporates.id',
          to: 'corporate_invoices.corporateId',
        },
      },
    };
  }
}
