import { Mapping } from '../sql.model';

export class ParkingTokenReconciled extends Mapping {
    static get tableName() {
    return 'parking_token_reconciled';
  }

  id?: number;
  checkInDateTime?: string;
  checkOutDateTime?: string;
  site?: number;
  status?: string;
  hardware?: number;
  lot?: number;
  generatedDateTime?: string;
  customer?: number;
  vehicleType?: number;
  siteIdRealPark?: number;
  entryLaneId?: number;
  exitLaneId?: number;
  carNo?: string;
  paymentMethod?: number;
  uploadedDateTime?: Date | string;
  server?: number;
  tokenNumber?: string;
  paymentReference?: string;
  reconciliationStatus?: 'known' | 'unknown';
  vehicleCategory?: 'goverment' | 'company' | 'public';
  temp?: string;
  stay?: 'day' | 'night';
  paymentReference2?: string;
  type?: string;

    static get relationMappings() {
    return {
    };
  }
}
