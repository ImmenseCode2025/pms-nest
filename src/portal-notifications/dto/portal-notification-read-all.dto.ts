import { IsIn, IsOptional } from 'class-validator';
import { PORTAL_TYPES } from './portal-notification-list.dto';

// Body (or query) for PUT api/portal-notifications/read-all
export class PortalNotificationReadAllDto {
  @IsOptional()
  @IsIn(PORTAL_TYPES)
  portalType?: string;

  @IsOptional()
  userId?: number | string;

  @IsOptional()
  corporateId?: number | string;
}
