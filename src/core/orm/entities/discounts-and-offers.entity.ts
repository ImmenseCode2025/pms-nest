import { Mapping } from '../sql.model';

export class DiscountsAndOffers extends Mapping {
    static get tableName() {
    return 'discounts_and_offers';
  }

  description?: string;
  discountCode?: string;
  discountCategory?: "percentage" | "amount";
  discountAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  userId?: number;
  discountStatus?: "valid" | "not valid";
  discountStartDate?: Date | string;
  discountEndDate?: Date | string;
  assigneeId?: number;
  assignTo?: "parking_site" | "parking_block" | "parking_block_floor" | "parking_lot" | "customer";
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
