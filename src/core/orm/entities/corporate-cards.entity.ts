import { Mapping } from 'src/core/orm/sql.model';

export class CorporateCards extends Mapping {
  static table = 'corporate_cards';

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
    return {};
  }
}
