import { IsOptional, IsString } from 'class-validator';

export class BatchUploadDto {
  @IsOptional()
  @IsString()
  siteId?: string;
}
