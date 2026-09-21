import { Module } from '@nestjs/common';
import { FilesUploadController } from './files-upload.controller';
import { FilesUploadService } from './files-upload.service';

@Module({
  controllers: [FilesUploadController],
  providers: [FilesUploadService],
  exports: [FilesUploadService],
})
export class FilesUploadModule {}
