import { Module } from '@nestjs/common';
import { PortalNotificationsController } from './portal-notifications.controller';
import { PortalNotificationsService } from './portal-notifications.service';

@Module({
  controllers: [PortalNotificationsController],
  providers: [PortalNotificationsService],
  exports: [PortalNotificationsService],
})
export class PortalNotificationsModule {}
