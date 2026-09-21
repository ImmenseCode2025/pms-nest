import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingBlock } from './parking-block.entity';
import { ParkingLot } from './parking-lot.entity';

export class ParkingBlockFloor extends Mapping {
    static get tableName() {
    return 'parking_block_floor';
  }

  name?: string;
  siteCode?: string;
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  parkingBlockId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      parkingBlockFloorUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_block_floor.user',
          to: 'user.id',
        },
      },
      parkingBlockFloors: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingBlock,
        join: {
          from: 'parking_block_floor.block',
          to: 'parking_block.id',
        },
      },
      floorParkingLot: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingLot,
        join: {
          from: 'parking_block_floor.id',
          to: 'parking_lot.floor',
        },
      },
    };
  }
}
