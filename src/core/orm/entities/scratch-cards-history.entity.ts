import { Mapping } from 'src/core/orm/sql.model';

export class ScratchCardsHistory extends Mapping {
  static table = 'scratch_cards_history';

  scratchCardsId?: number;
  siteId?: number;
  assignBy?: number;
  assignTo?: number;
  eventType?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
