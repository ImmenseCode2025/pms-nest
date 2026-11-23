import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { TokensPushService } from './tokens-push.service';

/**
 * Live -> site servers sync (public API). Change log: `sync_changes` (MySQL triggers sy bharta hai).
 * Site servers -> live: POST /api/sync/tokens/push (local tokens -> parking_token)
 */
@Module({
  controllers: [SyncController],
  providers: [SyncService, TokensPushService],
})
export class SyncModule {}
