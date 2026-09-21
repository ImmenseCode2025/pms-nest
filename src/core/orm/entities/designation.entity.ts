import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { FOC } from './foc.entity';
import { CompanyCards } from './company-cards.entity';

export class Designation extends Mapping {
    static get tableName() {
    return 'designation';
  }

  name?: string;
  userId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      designationUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'designation.user',
          to: 'user.id',
        },
      },
      designationFOC: {
        relation: Mapping.HasManyRelation,
        modelClass: FOC,
        join: {
          from: 'designation.id',
          to: 'foc_card.designation',
        },
      },
      designationCompanyCards: {
        relation: Mapping.HasManyRelation,
        modelClass: CompanyCards,
        join: {
          from: 'designation.id',
          to: 'company_cards.designation',
        },
      },
    };
  }
}
