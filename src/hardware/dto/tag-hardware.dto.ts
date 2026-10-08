import { IsNotEmpty } from 'class-validator';

export class TagHardwareDto {
  @IsNotEmpty()
  siteId: number;

  @IsNotEmpty()
  assignedUser?: number;
}
