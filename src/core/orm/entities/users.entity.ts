import { Mapping } from 'src/core/orm/sql.model';

export class Users extends Mapping {
  static table = 'user';

  static userSelect = [
    'id',
    'first_name',
    'last_name',
    'user_name',
    'profile_image',
    'city',
    'state',
    'country',
  ];

  static modifyUser(builder) {
    builder.select(...Users.userSelect);
    builder.withGraphFetched('[blocked_by_me, has_blocked_me]');
  }

  $formatJson(json) {
    delete json.password;

    // Unified boolean state
    json.is_blocked = !!(json.blocked_by_me || json.has_blocked_me);

    delete json.blocked_by_me;
    delete json.has_blocked_me;

    return json;
  }

  static get relationMappings() {
    return {
      // profile_meta: {
      //   relation: Mapping.HasOneRelation,
      //   modelClass: Profile,
      //   join: {
      //     from: 'users.id',
      //     to: 'profile.user_id',
      //   },
      // },
    };
  }
}
