import { IsIn, IsNotEmpty } from 'class-validator';

export class HardwareAssigneesDto {
  @IsNotEmpty()
  @IsIn(['parking site', 'parking gate', 'parking block', 'hardware'])
  assigned_to: string;
}
