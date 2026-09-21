import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfiguration } from './app.configuration';

@Injectable()
export class AppConfigService {
  constructor(
    private configService: NestConfigService,
    private readonly appConfiguration: AppConfiguration,
  ) {}

  get r2AccountId(): string {
    return this.appConfiguration.r2AccountId || process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  }

  get r2AccessKeyId(): string {
    return this.appConfiguration.r2AccessKeyId || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  }

  get r2SecretAccessKey(): string {
    return this.appConfiguration.r2SecretAccessKey || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  }

  get r2BucketName(): string {
    return this.appConfiguration.r2BucketName || process.env.CLOUDFLARE_R2_BUCKET_NAME || 'kmc';
  }

  get r2Endpoint(): string {
    return (
      this.appConfiguration.r2Endpoint ||
      process.env.CLOUDFLARE_R2_ENDPOINT ||
      `https://${this.r2AccountId}.r2.cloudflarestorage.com`
    );
  }

  get r2PublicUrl(): string {
    return this.appConfiguration.r2PublicUrl || process.env.CLOUDFLARE_R2_PUBLIC_URL;
  }

  getR2Url(key: string): string {
    if (!key) return null;
    if (key.startsWith('http')) return key;
    if (this.r2PublicUrl) {
      const baseUrl = this.r2PublicUrl.endsWith('/')
        ? this.r2PublicUrl.slice(0, -1)
        : this.r2PublicUrl;
      const objectKey = key.startsWith('/') ? key.slice(1) : key;
      return `${baseUrl}/${objectKey}`;
    }
    return `https://${this.r2AccountId}.r2.cloudflarestorage.com/${this.r2BucketName}/${key}`;
  }
}
