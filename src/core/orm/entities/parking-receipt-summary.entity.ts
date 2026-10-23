import { Mapping } from '../sql.model';

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
  totalRevenue?: number;
  amountToSubmit?: number;
  shiftStartDateTime?: Date | string;
  shiftEndDateTime?: Date | string;
  generationDateTime?: Date | string;
  siteId?: number;
  handheldId?: number;
}
