import { Module } from '@nestjs/common';
import { FilesUploadModule } from 'src/files-upload/files-upload.module';
import { HandheldPaymentReceiptsController } from './handheld-payment-receipts.controller';
import { HandheldPaymentReceiptsService } from './handheld-payment-receipts.service';

@Module({
  imports: [FilesUploadModule],
  controllers: [HandheldPaymentReceiptsController],
  providers: [HandheldPaymentReceiptsService],
  exports: [HandheldPaymentReceiptsService],
})
export class HandheldPaymentReceiptsModule {}
