import { ConfigifyModule } from '@itgorillaz/configify';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppCacheModule } from './core/app-cache/app-cache.module';
import { AppQueueModule } from './core/app-queue/app-queue.module';
import { AppConfigModule } from './core/config/app-config.module';
import { AdminGuard } from './core/guard/admin.guard';
import { JwtAuthGuard } from './core/guard/jwt-auth.guard';
import { CustomLoggerModule } from './core/logger/custom-logger.module';
import { RequestContextMiddleware } from './core/middleware/request-context.middleware';
import { SocketGatewayModule } from './core/socket-gateway/socket-gateway.module';
import { TasksModule } from './core/tasks/tasks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CorporateCardsModule } from './corporate-cards/corporate-cards.module';
import { FilesUploadModule } from './files-upload/files-upload.module';
import { ParkingTicketsModule } from './parking-tickets/parking-tickets.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      maxListeners: 10000,
      verboseMemoryLeak: false,
      ignoreErrors: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
      serveRoot: '/public/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/dist'),
    }),
    ConfigifyModule.forRootAsync(),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    SocketGatewayModule,
    UsersModule,
    AuthModule,
    CorporateCardsModule,
    ParkingTicketsModule,
    DashboardModule,
    PaymentGatewayModule,
    AppQueueModule,
    AppCacheModule,
    CustomLoggerModule,
    AppConfigModule,
    TasksModule,
    FilesUploadModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: CsrfGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
