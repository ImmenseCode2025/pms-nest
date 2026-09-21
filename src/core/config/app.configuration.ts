import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Configuration()
export class AppConfiguration {
  @IsNotEmpty()
  @Value('BASE_URL')
  baseUrl: string;

  @IsNotEmpty()
  @Value('DATABASE_HOST')
  databaseHost: string;

  @IsNotEmpty()
  @Value('DATABASE_PORT', {
    parse: (value: any) => parseInt(value),
  })
  databasePort: number;

  @IsNotEmpty()
  @Value('NODE_ENV')
  nodeEnv: string;

  @IsNotEmpty()
  @Value('DATABASE_NAME')
  databaseName: string;

  @IsNotEmpty()
  @Value('DATABASE_USER')
  databaseUser: string;

  @IsOptional()
  @Value('DATABASE_PASSWORD')
  databasePassword: string;

  @IsNotEmpty()
  @Value('APP_PORT', {
    parse: (value: any) => parseInt(value),
  })
  appPort: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_ACCOUNT_ID')
  r2AccountId: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_ACCESS_KEY_ID')
  r2AccessKeyId: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
  r2SecretAccessKey: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_BUCKET_NAME')
  r2BucketName: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_ENDPOINT')
  r2Endpoint: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_PUBLIC_URL')
  r2PublicUrl: string;

  @IsOptional()
  @Value('CLOUDFLARE_R2_API_TOKEN')
  r2ApiToken: string;
}
