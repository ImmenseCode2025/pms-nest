import { Mapping } from 'src/core/orm/sql.model';
import { Users } from './users.entity';

export class UserAccessToken extends Mapping {
  static table = 'user_access_token';

  id: number;
  user: number;
  token: string;
  macAddress: string;
  status: 'active' | 'expired';
  generatedDateTime: Date;
  updatedAt: Date;

  // Relations
  user_detail?: Users;

  static get relationMappings() {
    return {
      user_detail: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'user_access_token.user',
          to: 'user.id',
        },
      },
    };
  }
}
