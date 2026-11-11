import { Mapping } from '../sql.model';
import { Users } from './users.entity';

export class InstanceEntranceExit extends Mapping {
    static get tableName() {
    return 'instance_entrance_or_exit';
  }

  id?: number;
  name?: string;
  sgi?: string;
  gate?: number;
  type?: 'entrance' | 'exit';
  status?: 'pending' | 'active' | 'inactive' | 'outOfService';
  creationDateTime?: Date | string;
  user?: number;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      instanceEntranceExitUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'instance_entrance_or_exit.user',
          to: 'user.id',
        },
      },
    };
  }
}
