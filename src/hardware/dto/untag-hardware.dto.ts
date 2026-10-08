import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UntagHardwareDto {
  @IsNotEmpty()
  siteId: number;

  @IsOptional()
  @IsString()
  description?: string;
}
