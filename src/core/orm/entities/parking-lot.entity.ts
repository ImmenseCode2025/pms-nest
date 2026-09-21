import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { ParkingBlockFloor } from './parking-block-floor.entity';
import { ParkingToken } from './parking-token.entity';

export class ParkingLot extends Mapping {
    static get tableName() {
    return 'parking_lot';
  }

  name?: string;
  siteCode?: string;
  status?: "pending" | "active" | "inactive" | "outOfService";
  userId?: number;
  parkingBlockFloorId?: number;
  longitude?: number;
  latitude?: number;
  availability?: "occupied" | "unoccupied";
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      parkingLotUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_lot.user',
          to: 'user.id',
        },
      },
      parkingLotParkingBlockFloors: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingBlockFloor,
        join: {
          from: 'parking_lot.floor',
          to: 'parking_block_floor.id',
        },
      },
      lotParkingTokens: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingToken,
        join: {
          from: 'parking_lot.id',
          to: 'parking_token.lot',
        },
      },
    };
  }
}
