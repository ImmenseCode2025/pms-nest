import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from './app-cache.constants';
import { AppCacheService } from './app-cache.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);

        return {
          stores: new KeyvRedis(`redis://${host}:${port}`),
        };
      },
    }),
  ],
  providers: [
    AppCacheService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);

        return new IORedis(port, host);
      },
    },
  ],
  exports: [AppCacheService, CacheModule],
})
export class AppCacheModule {}
