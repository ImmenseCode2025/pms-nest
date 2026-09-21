import { Mapping } from '../sql.model';
import { ParkingBlockFloor } from './parking-block-floor.entity';
import { Users } from './users.entity';
import { Address } from './address.entity';
import { ParkingSite } from './parking-site.entity';
import { ParkingGate } from './parking-gate.entity';
import { ParkingCard } from './parking-card.entity';

export class ParkingBlock extends Mapping {
    static get tableName() {
    return 'parking_block';
  }

  name?: string;
  siteCode?: string;
  addressId?: number;
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  parkingSiteId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      parkingBlocksFloor: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingBlockFloor,
        join: {
          from: 'parking_block.id',
          to: 'parking_block_floor.block',
        },
      },
      parkingBlockUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_block.user',
          to: 'user.id',
        },
      },
      parkingBlockAddresses: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'parking_block.address',
          to: 'address.id',
        },
      },
      parkingBlockParkingSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'parking_block.site',
          to: 'parking_site.id',
        },
      },
      parkingGateParkingBlocks: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingGate,
        join: {
          from: 'parking_block.id',
          to: 'parking_gate.block',
        },
      },
      blockParkingCards: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingCard,
        join: {
          from: 'parking_block.id',
          to: 'parking_card.parkingBlock',
        },
      },
    };
  }
}
