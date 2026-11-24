import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Customer } from './customer.entity';
import { Corporate } from './corporate.entity';

export class Address extends Mapping {
    static get tableName() {
    return 'address';
  }

  id?: number;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: number;
  longitude?: number;
  latitude?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      usersAtAddress: {
        relation: Mapping.HasManyRelation,
        modelClass: Users,
        join: {
          from: 'address.id',
          to: 'user.address',
        },
      },
      addressCustomer: {
        relation: Mapping.HasManyRelation,
        modelClass: Customer,
        join: {
          from: 'address.id',
          to: 'customer.address',
        },
      },
      addressCorporate: {
        relation: Mapping.HasManyRelation,
        modelClass: Corporate,
        join: {
          from: 'address.id',
          to: 'corporates.address',
        },
      },
    };
  }
}
