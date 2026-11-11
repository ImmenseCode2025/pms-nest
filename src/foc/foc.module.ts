import { Module } from '@nestjs/common';
import { FocController } from './foc.controller';
import { FocService } from './foc.service';

@Module({
  controllers: [FocController],
  providers: [FocService],
  exports: [FocService],
})
export class FocModule {}
