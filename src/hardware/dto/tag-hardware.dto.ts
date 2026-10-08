import { IsNotEmpty, IsString } from 'class-validator';

export class TagHardwareDto {
  @IsNotEmpty()
  siteId: number;

  @IsNotEmpty()
  assignedUser?: number;

  @IsNotEmpty()
  description?: string;
}
