import { Module } from '@nestjs/common';
import { SiteMonitorController } from './site-monitor.controller';
import { SiteMonitorGateway } from './site-monitor.gateway';
import { SiteMonitorService } from './site-monitor.service';

/**
 * Site desktop apps ka realtime online/offline status (Socket.IO namespace: /site-monitor).
 */
@Module({
  controllers: [SiteMonitorController],
  providers: [SiteMonitorService, SiteMonitorGateway],
})
export class SiteMonitorModule {}
