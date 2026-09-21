import { Mapping } from '../sql.model';
import { ScratchCard } from './scratch-card.entity';

export class ParkingTokenReconciled extends Mapping {
    static get tableName() {
    return 'parking_token_reconciled_5';
  }

  tokenNumber?: string;
  paymentReference?: string;

    static get relationMappings() {
    return {
      scratchCardToken: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ScratchCard,
        join: {
          from: 'parking_token_reconciled_5.paymentReference',
          to: 'scratch_card.id',
        },
      },
    };
  }
}
