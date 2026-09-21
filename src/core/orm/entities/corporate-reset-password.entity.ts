import { Mapping } from '../sql.model';
import { Corporate } from './corporate.entity';

export class CorporateResetPassword extends Mapping {
    static get tableName() {
    return 'corporate_reset_password_otp';
  }

  resetCode?: string;
  corporateId?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;

    static get relationMappings() {
    return {
      resetPasswordCorporate: {
        relation: Mapping.BelongsToOneRelation,
        modelClass: Corporate,
        join: {
          from: 'corporate_reset_password_otp.corporate',
          to: 'corporates.id',
        },
      },
    };
  }
}
