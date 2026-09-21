import { Mapping } from '../sql.model';
import { Users } from './users.entity';
import { Company } from './company.entity';
import { Customer } from './customer.entity';
import { ParkingBlock } from './parking-block.entity';
import { ParkingGate } from './parking-gate.entity';
import { ParkingSite } from './parking-site.entity';
import { Corporate } from './corporate.entity';

export class Address extends Mapping {
    static get tableName() {
    return 'address';
  }

  name?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: number;
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
      addressCompany: {
        relation: Mapping.HasManyRelation,
        modelClass: Company,
        join: {
          from: 'address.id',
          to: 'company.address',
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
      addressParkingBlock: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingBlock,
        join: {
          from: 'address.id',
          to: 'parking_block.address',
        },
      },
      addressParkingGate: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingGate,
        join: {
          from: 'address.id',
          to: 'parking_gate.address',
        },
      },
      addressParkingSite: {
        relation: Mapping.HasManyRelation,
        modelClass: ParkingSite,
        join: {
          from: 'address.id',
          to: 'parking_site.address',
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
