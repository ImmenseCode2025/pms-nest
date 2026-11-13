import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

/**
 * Live -> site servers sync (public API). Change log: `sync_changes` (MySQL triggers sy bharta hai).
 */
@Module({
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
