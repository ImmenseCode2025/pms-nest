import { Mapping } from 'src/core/orm/sql.model';

export class Users extends Mapping {
  static table = 'user';





  $formatJson(json) {
    delete json.password;
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
