import { Mapping } from '../sql.model';
import { Room } from './room.entity';
import { Address } from './address.entity';
import { ParkingSite } from './parking-site.entity';
import { Company } from './company.entity';
import { Designation } from './designation.entity';
import { FOC } from './foc.entity';
import { ParkingShiftClosing } from './parking-shift-closing.entity';
import { Hardware } from './hardware.entity';
import { InstanceEntranceExit } from './instance-entrance-exit.entity';
import { ParkingBlockFloor } from './parking-block-floor.entity';
import { ParkingBlock } from './parking-block.entity';
import { ParkingGate } from './parking-gate.entity';
import { ParkingLot } from './parking-lot.entity';
import { PaymentGateway } from './payment-gateway.entity';
import { VehicleType } from './vehicle-type.entity';
import { UserAccessToken } from './user-access-token.entity';
import { EntranceExitMonitor } from './entrance-exit-monitor.entity';
import { ParkingPrice } from './parking-price.entity';
import { Discount } from './discount.entity';
import { HardwareAssignLogs } from './hardware-assign-logs.entity';
import { ParkingPriceLogs } from './parking-price-logs.entity';
import { ScratchCard } from './scratch-card.entity';
import { ScratchCards } from './scratch-cards.entity';
import { ScratchCardsHistory } from './scratch-cards-history.entity';
import { PortalNotification } from './portal-notification.entity';
import { PosQrCode } from './pos-qr-code.entity';

export class Users extends Mapping {
    static get tableName() {
    return 'user';
  }





  $formatJson(json) {
    delete json.password;
    return json;
  }

    static get relationMappings() {
    return {
      ownedRooms: {
        relation: Mapping.HasManyRelation,
        modelClass: Room,
        join: {
          from: 'user.id',
          to: 'rooms.owner',
        },
      },
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
      userCompany: {
        relation: Mapping.HasManyRelation,
        modelClass: Company,
        join: {
          from: 'user.id',
          to: 'company.user',
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
      userParkingBlockFloor: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingBlockFloor,
        join: {
          from: 'user.id',
          to: 'parking_block_floor.user',
        },
      },
      userParkingBlock: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingBlock,
        join: {
          from: 'user.id',
          to: 'parking_block.user',
        },
      },
      userParkingGate: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingGate,
        join: {
          from: 'user.id',
          to: 'parking_gate.user',
        },
      },
      userParkingLot: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingLot,
        join: {
          from: 'user.id',
          to: 'parking_lot.user',
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
      userVehicleType: {
        relation: Mapping.HasManyRelation,
        modelClass: VehicleType,
        join: {
          from: 'user.id',
          to: 'vehicle_type.user',
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
      userEntranceExitMonitor: {
        relation: Mapping.HasManyRelation,
        modelClass: EntranceExitMonitor,
        join: {
          from: 'user.id',
          to: 'entrance_exit_monitor.user',
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
      userDiscounts: {
        relation: Mapping.HasManyRelation,
        modelClass: Discount,
        join: {
          from: 'user.id',
          to: 'discount.user',
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
      userParkingPriceLogs: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingPriceLogs,
        join: {
          from: 'user.id',
          to: 'parking_price_logs.user',
        },
      },
      scratchCardUsers: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCard,
        join: {
          from: 'user.id',
          to: 'scratch_card.user',
        },
      },
      OperatorScratchCards: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCards,
        join: {
          from: 'user.id',
          to: 'scratch_cards.operator_id',
        },
      },
      AssignedByScratchCard: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCardsHistory,
        join: {
          from: 'user.id',
          to: 'scratch_cards_history.assign_by',
        },
      },
      AssignedUserScratchCard: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCardsHistory,
        join: {
          from: 'user.id',
          to: 'scratch_cards_history.assign_to',
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
