import { Mapping } from '../sql.model';
import { Address } from './address.entity';
import { ParkingSite } from './parking-site.entity';
import { Designation } from './designation.entity';
import { FOC } from './foc.entity';
import { ParkingShiftClosing } from './parking-shift-closing.entity';
import { Hardware } from './hardware.entity';
import { InstanceEntranceExit } from './instance-entrance-exit.entity';
import { PaymentGateway } from './payment-gateway.entity';
import { UserAccessToken } from './user-access-token.entity';
import { ParkingPrice } from './parking-price.entity';
import { HardwareAssignLogs } from './hardware-assign-logs.entity';
import { PortalNotification } from './portal-notification.entity';
import { PosQrCode } from './pos-qr-code.entity';

export class Users extends Mapping {
  static get tableName() {
    return 'user';
  }

  id?: number;
  username?: string;
  password?: string;
  email?: string;
  contact?: string;
  cnic?: string;
  address?: number;
  location?: string;
  latitude?: string;
  longitude?: string;
  profile?: string;
  status?: 'incomplete' | 'completed' | 'block' | 'deleted';
  creationDateTime?: Date | string;
  access?: 'employee' | 'admin' | 'master';
  site?: number;
  creationSource?: 'google' | 'microsoft' | 'facebook' | 'manual';
  user_type?: 'Admin' | 'User' | 'Customer';
  updatedAt?: Date | string;
  isDeleted?: boolean | number;

  $formatJson(json) {
    delete json.password;
    return json;
  }

    static get relationMappings() {
    return {
      userAddress: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'user.address',
          to: 'address.id',
        },
      },
      parkingSiteUser: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'user.site',
          to: 'parking_site.id',
        },
      },
      userDesignation: {
        relation: Mapping.HasManyRelation,
        modelClass: Designation,
        join: {
          from: 'user.id',
          to: 'designation.user',
        },
      },
      userFOC: {
        relation: Mapping.HasManyRelation,
        modelClass: FOC,
        join: {
          from: 'user.id',
          to: 'foc_card.user',
        },
      },
      userShiftClosing: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingShiftClosing,
        join: {
          from: 'user.id',
          to: 'parking_shift_closing.user',
        },
      },
      supervisorShiftClosing: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingShiftClosing,
        join: {
          from: 'user.id',
          to: 'parking_shift_closing.supervisor',
        },
      },
      userHardware: {
        relation: Mapping.HasManyRelation,
        modelClass: Hardware,
        join: {
          from: 'user.id',
          to: 'hardware.user',
        },
      },
      userAssignedHardware: {
        relation: Mapping.HasManyRelation,
        modelClass: Hardware,
        join: {
          from: 'user.id',
          to: 'hardware.assignedUser',
        },
      },
      userInstanceEntranceExit: {
        relation: Mapping.HasManyRelation,
        modelClass: InstanceEntranceExit,
        join: {
          from: 'user.id',
          to: 'instance_entrance_or_exit.user',
        },
      },
      userParkingSite: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingSite,
        join: {
          from: 'user.id',
          to: 'parking_site.user',
        },
      },
      userPaymentGateway: {
        relation: Mapping.HasManyRelation,
        modelClass: PaymentGateway,
        join: {
          from: 'user.id',
          to: 'payment_gateway.user',
        },
      },
      userUserAccessToken: {
        relation: Mapping.HasManyRelation,
        modelClass: UserAccessToken,
        join: {
          from: 'user.id',
          to: 'user_access_token.user',
        },
      },
      userParkingPrices: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPrice,
        join: {
          from: 'user.id',
          to: 'parking_price.user',
        },
      },
      userAssignLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: HardwareAssignLogs,
        join: {
          from: 'user.id',
          to: 'hardware_assign_logs.user',
        },
      },
      userAssignedHardwareLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: HardwareAssignLogs,
        join: {
          from: 'user.id',
          to: 'hardware_assign_logs.assignedUser',
        },
      },
      UserNotifications: {
        relation: Mapping.HasManyRelation,
        modelClass: PortalNotification,
        join: {
          from: 'user.id',
          to: 'portal_notifications.user',
        },
      },
      UsersGeneratedNotifications: {
        relation: Mapping.HasManyRelation,
        modelClass: PortalNotification,
        join: {
          from: 'user.id',
          to: 'portal_notifications.createdBy',
        },
      },
      userPosQrCodes: {
        relation: Mapping.HasManyRelation,
        modelClass: PosQrCode,
        join: {
          from: 'user.id',
          to: 'pos_qr_code.user',
        },
      },
    };
  }
}
