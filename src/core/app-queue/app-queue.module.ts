import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueNamesEnum } from 'src/core/helper/enum/global.enum';
import { AppQueueProcessor } from './app-queue.processor';
import { AppQueueService } from './app-queue.service';


@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue({
      name: QueueNamesEnum.TaskQueue,
    }),
  ],
  providers: [AppQueueProcessor, AppQueueService],
  exports: [AppQueueService, AppQueueProcessor, BullModule],
})
export class AppQueueModule {}
