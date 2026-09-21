import { Mapping } from '../sql.model';
import { CorporateQrCode } from './corporate-qr-code.entity';
import { Corporate } from './corporate.entity';
import { VehicleType } from './vehicle-type.entity';
import { Customer } from './customer.entity';

export class CorporateCards extends Mapping {
    static get tableName() {
    return 'corporate_cards';
  }

  corporateId?: number;
  requestId?: string;
  requestStatus?: "pending" | "approved" | "rejected";
  cardStatus?: "active" | "inactive" | "revoked";
  requestDate?: Date | string;
  approvalRemarks?: string;
  vehicleNumber?: string;
  vehicleType?: number;
  ownerName?: string;
  email?: string;
  mobileNumber?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  designation?: string;
  dob?: Date | string;
  approvedBy?: number;
  approvedDate?: Date | string;
  otpCode?: string;
  otpExpired?: Date | string;
  customer?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      corporateCardCorporateQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateQrCode,
        join: {
          from: 'corporate_cards.id',
          to: 'corporate_qr_code.corporateCardId',
        },
      },
      corporateCardsCorporate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Corporate,
        join: {
          from: 'corporate_cards.corporate',
          to: 'corporates.id',
        },
      },
      corporateCardsVehicleType: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: VehicleType,
        join: {
          from: 'corporate_cards.vehicleType',
          to: 'vehicle_type.id',
        },
      },
      corporateCardsCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'corporate_cards.customer',
          to: 'customer.id',
        },
      },
    };
  }
}
