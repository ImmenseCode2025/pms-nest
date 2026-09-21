import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { AppConfigService } from 'src/core/config/app-config.service';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadDto } from './dto/files-upload.dto';

@Injectable()
export class FilesUploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly appConfigService: AppConfigService) {
    this.bucketName = this.appConfigService.r2BucketName;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.appConfigService.r2Endpoint,
      credentials: {
        accessKeyId: this.appConfigService.r2AccessKeyId,
        secretAccessKey: this.appConfigService.r2SecretAccessKey,
      },
    });
  }

  async uploadFile(files: any, dto: FileUploadDto) {
    const uploadResults: string[] = [];
    const mediaFiles = files?.media || (Array.isArray(files) ? files : []);

    for (const file of mediaFiles) {
      try {
        const fileExtension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExtension);

        // Make filename safe
        const safeBaseName = baseName.replace(/\s+/g, '-');
        const uuid = uuidv4();
        const destination = (dto.destination || 'uploads').replace(/^\/+|\/+$/g, '');
        const s3Key = `${destination}/${safeBaseName}-${uuid}${fileExtension}`;

        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);
        const fullUrl = this.appConfigService.getR2Url(s3Key);
        uploadResults.push(fullUrl);
      } catch (error) {
        console.error('R2 / S3 Upload Error:', error);
        throw error;
      }
    }

    return uploadResults;
  }
}
