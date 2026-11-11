import { IsIn, IsNotEmpty } from 'class-validator';

export class HardwareAssigneesDto {
  @IsNotEmpty()
  @IsIn(['parking site', 'hardware'])
  assigned_to: string;
}
