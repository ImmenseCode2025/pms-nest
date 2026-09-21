import { Module } from '@nestjs/common';
import { NotificationActions } from './notification-actions';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  // imports: [SocketsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationActions],
  exports: [NotificationsService, NotificationActions],
})
export class NotificationsModule {}
