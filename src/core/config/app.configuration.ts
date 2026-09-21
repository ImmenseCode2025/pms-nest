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
}
