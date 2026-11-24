import { IsIn, IsOptional } from 'class-validator';

export const PORTAL_TYPES = ['user', 'admin', 'mobile', 'corporate'];

// Query for GET api/portal-notifications
export class PortalNotificationListDto {
  // Omit for all portals (legacy behaviour)
  @IsOptional()
  @IsIn(PORTAL_TYPES)
  portalType?: string;
}
