import { Mapping } from 'src/core/orm/sql.model';

export class ParkingTokenReconciled extends Mapping {
  static table = 'parking_token_reconciled_5';

  tokenNumber?: string;
  paymentReference?: string;

  static get relationMappings() {
    return {};
  }
}
