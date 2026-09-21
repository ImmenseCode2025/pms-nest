import { Global, Module } from '@nestjs/common';
import { RequestContextService } from '../middleware/request-context.service';
import { CustomLoggerService } from './custom-logger.service';

@Global()
@Module({
  providers: [CustomLoggerService, RequestContextService],
  exports: [CustomLoggerService, RequestContextService],
})
export class CustomLoggerModule {}
