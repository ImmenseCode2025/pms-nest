import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Address } from './address.entity';
import { FOC } from './foc.entity';
import { ParkingSite } from './parking-site.entity';
import { ScratchCard } from './scratch-card.entity';

export class Company extends Mapping {
    static get tableName() {
    return 'company';
  }

  name?: string;
  addressId?: number;
  contact?: string;
  email?: string;
  logo?: string;
  userId?: number;
  shortCode?: string;
  statusCompany?: "pending" | "active" | "inactive";
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      companyUsers: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'company.user',
          to: 'user.id',
        },
      },
      companyAddresses: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'company.address',
          to: 'address.id',
        },
      },
      companyFOC: {
        relation: Mapping.HasManyRelation,
        modelClass: FOC,
        join: {
          from: 'company.id',
          to: 'foc_card.company',
        },
      },
      companyParkingSites: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingSite,
        join: {
          from: 'company.id',
          to: 'parking_site.company',
        },
      },
      scratchCardCompanies: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCard,
        join: {
          from: 'company.id',
          to: 'scratch_card.company',
        },
      },
    };
  }
}
