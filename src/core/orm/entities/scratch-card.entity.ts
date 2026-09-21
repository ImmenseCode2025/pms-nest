import { Mapping } from '../sql.model';
import { Company } from './company.entity';
import { Users } from './users.entity';
import { Customer } from './customer.entity';
import { ParkingTokenReconciled } from './parking-token-reconciled.entity';
import { ScratchCards } from './scratch-cards.entity';

export class ScratchCard extends Mapping {
    static get tableName() {
    return 'scratch_card';
  }

  code?: string;
  companyId?: number;
  amountOptions?: "50" | "100" | "200" | "500" | "1000";
  scratchCardStatus?: "active" | "inactive" | "expired" | "onhold";
  createdAt?: Date | string;
  updatedAt?: Date | string;
  generatedBy?: number;
  serialNo?: string;
  userId?: number;
  ticketNumber?: string;
  utilizedDateTime?: Date | string;
  customerId?: number;
  utilizedBy?: "Ticket Machine" | "Handheld" | "Mobile App";
  receiptNumber?: string;

    static get relationMappings() {
    return {
      companyScratchCards: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: 'scratch_card.company',
          to: 'company.id',
        },
      },
      userScratchCards: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Users,
        join: {
          from: 'scratch_card.user',
          to: 'user.id',
        },
      },
      cardCustomer: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: 'scratch_card.customer',
          to: 'customer.id',
        },
      },
      parkingTokenReconciled: {
        relation: Mapping.HasOneRelation,
        modelClass: ParkingTokenReconciled,
        join: {
          from: 'scratch_card.id',
          to: 'parking_token_reconciled_5.paymentReference',
        },
      },
      scratchCardUsedIn: {
        relation: Mapping.HasOneRelation,
        modelClass: ScratchCards,
        join: {
          from: 'scratch_card.id',
          to: 'scratch_cards.card_serial_no',
        },
      },
    };
  }
}
