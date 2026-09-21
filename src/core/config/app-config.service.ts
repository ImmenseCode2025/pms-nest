import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config'; // Import NestJS ConfigService

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  getS3Url(): string {
    return this.configService.get<string>('S3_URL');
  }
}
