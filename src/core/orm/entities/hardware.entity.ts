import { Mapping } from '../sql.model';
import { AppQrCode } from './app-qr-code.entity';
import { CashQrCode } from './cash-qr-code.entity';
import { CompanyQrCode } from './company-qr-code.entity';
import { CorporateQrCode } from './corporate-qr-code.entity';
import { EntranceExitMonitor } from './entrance-exit-monitor.entity';
import { FocQrCode } from './foc-qr-code.entity';
import { HardwareAssignLogs } from './hardware-assign-logs.entity';
import { ParkingShiftClosing } from './parking-shift-closing.entity';
import { ParkingSite } from './parking-site.entity';
import { ParkingToken } from './parking-token.entity';
import { PosQrCode } from './pos-qr-code.entity';
import { Users } from './users.entity';

export class Hardware extends Mapping {
    static get tableName() {
    return 'hardware';
  }

  partName?: string;
  description?: string;
  configuration?: string;
  type?: "camera" | "barrier" | "license plate recognizer" | "personal computer" | "handheld" | "pos";
  status?: "active" | "inactive" | "outOfService" | "maintenance";
  userId?: number;
  assignedTo?: "parking site" | "parking gate" | "parking lot" | "hardware" | "parking block" | "parking floor";
  asignee?: number;
  assignedUser?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  uniqueId?: string;

    static get relationMappings() {
    return {
      hardwareShiftClosing: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingShiftClosing,
        join: {
          from: 'hardware.id',
          to: 'parking_shift_closing.deviceId',
        },
      },
      hardwareUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'hardware.user',
          to: 'user.id',
        },
      },
      hardwareAssignedUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'hardware.assignedUser',
          to: 'user.id',
        },
      },
      hardwareParkingTokens: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingToken,
        join: {
          from: 'hardware.id',
          to: 'parking_token.hardware',
        },
      },
      hardwareEntranceExitMonitor: {
        relation: Mapping.HasManyRelation,
        modelClass: EntranceExitMonitor,
        join: {
          from: 'hardware.id',
          to: 'entrance_exit_monitor.hardware',
        },
      },
      hardwareAssignLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: HardwareAssignLogs,
        join: {
          from: 'hardware.id',
          to: 'hardware_assign_logs.hardware',
        },
      },
      hardwareAppQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: AppQrCode,
        join: {
          from: 'hardware.id',
          to: 'app_qr_code.hardware',
        },
      },
      hardwareCompanyQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: CompanyQrCode,
        join: {
          from: 'hardware.id',
          to: 'company_qr_code.hardware',
        },
      },
      hardwareFocQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: FocQrCode,
        join: {
          from: 'hardware.id',
          to: 'foc_qr_code.hardware',
        },
      },
      hardwareCashQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: CashQrCode,
        join: {
          from: 'hardware.id',
          to: 'cash_qr_code.hardware',
        },
      },
      hardwarePosQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: PosQrCode,
        join: {
          from: 'hardware.id',
          to: 'pos_qr_code.hardware',
        },
      },
      hardwareCorporateQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: CorporateQrCode,
        join: {
          from: 'hardware.id',
          to: 'corporate_qr_code.hardware',
        },
      },
      parkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        modify(query) {
          query.select('id', 'name');
        },
        join: {
          from: 'hardware.asignee',
          to: 'parking_site.id',
        },
      },
    };
  }
}
