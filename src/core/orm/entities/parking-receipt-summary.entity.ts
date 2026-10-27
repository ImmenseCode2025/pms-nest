import { Mapping } from '../sql.model';
import { Hardware } from './hardware.entity';
import { Operator } from './operator.entity';
import { ParkingSite } from './parking-site.entity';

export class ParkingReceiptSummary extends Mapping {
  static get tableName() {
    return 'parking_receipt_summary';
  }

  id?: number;
  totalTickets?: number;
  paidCarTickets?: number;
  paidVanTickets?: number;
  paidBusTickets?: number;
  paidBikeTickets?: number;
  focTickets?: number;
  focCarTickets?: number;
  focVanTickets?: number;
  focBusTickets?: number;
  focBikeTickets?: number;
  siteId?: number;
  handheldId?: number;
  operatorId?: number;
  summary_date?: Date | string;
  totalRevenue?: number;
  submittedAmount?: number;
  varianceAmount?: number;
  created_at?: Date | string;
  updated_at?: Date | string;

  static get relationMappings() {
    return {
      site: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: ParkingSite,
        join: {
          from: 'parking_receipt_summary.siteId',
          to: 'parking_site.id',
        },
      },
      operator: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Operator,
        join: {
          from: 'parking_receipt_summary.operatorId',
          to: 'operators.id',
        },
      },
      hardware: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Hardware,
        join: {
          from: 'parking_receipt_summary.handheldId',
          to: 'hardware.id',
        },
      },
    };
  }
}
