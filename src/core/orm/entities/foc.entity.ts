import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Designation } from './designation.entity';
import { ParkingSite } from './parking-site.entity';
import { Company } from './company.entity';
import { FocQrCode } from './foc-qr-code.entity';
import { CashQrCode } from './cash-qr-code.entity';

export class FOC extends Mapping {
    static get tableName() {
    return 'foc_card';
  }

  parkingSiteId?: number;
  employeeId?: string;
  employeeName?: string;
  dateJoining?: Date | string;
  companyId?: number;
  designationId?: number;
  shiftTimeFrom?: Date | string;
  shiftTimeTo?: Date | string;
  profilePic?: string;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      focUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'foc_card.user',
          to: 'user.id',
        },
      },
      focDesignations: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Designation,
        join: {
          from: 'foc_card.designation',
          to: 'designation.id',
        },
      },
      focParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'foc_card.site',
          to: 'parking_site.id',
        },
      },
      focCompanies: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: 'foc_card.company',
          to: 'company.id',
        },
      },
      qrCodesFOC: {
        relation: Mapping.HasManyRelation,
        modelClass: FocQrCode,
        join: {
          from: 'foc_card.id',
          to: 'foc_qr_code.employeeId',
        },
      },
      qrCodesCash: {
        relation: Mapping.HasManyRelation,
        modelClass: CashQrCode,
        join: {
          from: 'foc_card.id',
          to: 'cash_qr_code.employeeId',
        },
      },
    };
  }
}
