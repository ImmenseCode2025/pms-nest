import { Mapping } from '../sql.model';
import { ScratchCards } from './scratch-cards.entity';
import { ParkingSite } from './parking-site.entity';
import { Users } from './users.entity';

export class ScratchCardsHistory extends Mapping {
    static get tableName() {
    return 'scratch_cards_history';
  }

  scratchCardsId?: number;
  siteId?: number;
  assignBy?: number;
  assignTo?: number;
  eventType?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      ScratchCardsEventHistory: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ScratchCards,
        join: {
          from: 'scratch_cards_history.scratch_card_id',
          to: 'scratch_cards.id',
        },
      },
      ScratchCardsEventSite: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'scratch_cards_history.site_id',
          to: 'parking_site.id',
        },
      },
      ScratchCardAssignedBy: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'scratch_cards_history.assign_by',
          to: 'user.id',
        },
      },
      ScratchCardAssignedTo: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'scratch_cards_history.assign_to',
          to: 'user.id',
        },
      },
    };
  }
}
