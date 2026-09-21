import { Mapping } from 'src/core/orm/sql.model';

export class PortalNotification extends Mapping {
  static table = 'portal_notifications';

  title?: string;
  message?: string;
  userId?: number;
  corporateId?: number;
  createdBy?: number;
  portalType?: string;
  data?: any;
  read?: boolean;

  static get relationMappings() {
    return {};
  }
}
