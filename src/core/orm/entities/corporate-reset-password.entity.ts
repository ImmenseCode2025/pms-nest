import { Mapping } from 'src/core/orm/sql.model';

export class CorporateResetPassword extends Mapping {
  static table = 'corporate_reset_password_otp';

  resetCode?: string;
  corporateId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  static get relationMappings() {
    return {};
  }
}
