import { IsNotEmpty } from 'class-validator';

export class GetHandheldInfoDto {
  @IsNotEmpty()
  siteId: any;
}

