import { Mapping } from '../sql.model';
import { ScratchCard } from './scratch-card.entity';
import { Users } from './users.entity';
import { ScratchCardsHistory } from './scratch-cards-history.entity';

export class ScratchCards extends Mapping {
    static get tableName() {
    return 'scratch_cards';
  }

  code?: string;
  operatorId?: number;
  eventType?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  serialNo?: string;

    static get relationMappings() {
    return {
      scratchCardSerial: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ScratchCard,
        join: {
          from: 'scratch_cards.card_serial_no',
          to: 'scratch_card.id',
        },
      },
      ScarchCardsOperators: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'scratch_cards.operator_id',
          to: 'user.id',
        },
      },
      HistoryEventScratchCard: {
        relation: Mapping.HasManyRelation,
        modelClass: ScratchCardsHistory,
        join: {
          from: 'scratch_cards.id',
          to: 'scratch_cards_history.scratch_card_id',
        },
      },
    };
  }
}
