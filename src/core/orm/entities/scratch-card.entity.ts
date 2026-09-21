import { Mapping } from 'src/core/orm/sql.model';

export class ScratchCard extends Mapping {
  static table = 'scratch_card';

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
    return {};
  }
}
