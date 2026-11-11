import { IsIn, IsOptional } from 'class-validator';

export class HardwareDropdownDto {
  // Filter by hardware type; omit for all
  @IsOptional()
  @IsIn(['camera', 'barrier', 'license plate recognizer', 'personal computer', 'handheld', 'pos'])
  type?: string;
}
