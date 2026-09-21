import { Mapping } from '../sql.model';
import { Designation } from './designation.entity';
import { ParkingSite } from './parking-site.entity';

export class CompanyCards extends Mapping {
    static get tableName() {
    return 'company_cards';
  }

  parkingSiteId?: number;
  employeeName?: string;
  vehicleNumber?: string;
  companyName?: string;
  designationId?: number;
  shiftTimeFrom?: Date | string;
  shiftTimeTo?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      companyCardsDesignations: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Designation,
        join: {
          from: 'company_cards.designation',
          to: 'designation.id',
        },
      },
      companyCardsParkingSites: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'company_cards.site',
          to: 'parking_site.id',
        },
      },
    };
  }
}
