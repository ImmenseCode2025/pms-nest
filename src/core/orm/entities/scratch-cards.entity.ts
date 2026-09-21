import { Mapping } from 'src/core/orm/sql.model';

export class ScratchCards extends Mapping {
  static table = 'scratch_cards';

  code?: string;
  operatorId?: number;
  eventType?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  serialNo?: string;

  static get relationMappings() {
    return {};
  }
}
