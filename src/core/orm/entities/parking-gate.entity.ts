import { Mapping } from '../sql.model';
import { InstanceEntranceExit } from './instance-entrance-exit.entity';
import { ParkingBlock } from './parking-block.entity';
import { Users } from './users.entity';
import { Address } from './address.entity';

export class ParkingGate extends Mapping {
    static get tableName() {
    return 'parking_gate';
  }

  name?: string;
  siteCode?: string;
  parkingBlockId?: number;
  userId?: number;
  addressId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      parkingGateInstanceEntranceExit: {
        relation: Mapping.HasManyRelation,
        modelClass: InstanceEntranceExit,
        join: {
          from: 'parking_gate.id',
          to: 'instance_entrance_or_exit.gate',
        },
      },
      parkingBlockParkingGate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingBlock,
        join: {
          from: 'parking_gate.block',
          to: 'parking_block.id',
        },
      },
      parkingGateUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'parking_gate.user',
          to: 'user.id',
        },
      },
      parkingGateAddresses: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'parking_gate.address',
          to: 'address.id',
        },
      },
    };
  }
}
