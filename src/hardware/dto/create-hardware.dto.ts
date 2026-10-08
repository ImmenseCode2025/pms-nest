import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHardwareDto {
  @IsOptional()
  @IsString()
  partName?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  configuration?: string;

  @IsOptional()
  @IsString()
  ipOrApi?: string;

  @IsOptional()
  @IsString()
  uniqueId?: string;

  @IsOptional()
  @IsEnum([
    'camera',
    'barrier',
    'license plate recognizer',
    'personal computer',
    'handheld',
    'pos',
  ])
  type?:
    | 'camera'
    | 'barrier'
    | 'license plate recognizer'
    | 'personal computer'
    | 'handheld'
    | 'pos';

  @IsOptional()
  @IsEnum(['active', 'inactive', 'outOfService', 'maintenance'])
  status?: 'active' | 'inactive' | 'outOfService' | 'maintenance';

  @IsNotEmpty()
  @IsEnum([
    'parking site',
    'parking gate',
    'parking lot',
    'hardware',
    'parking block',
    'parking floor',
  ])
  assignedTo:
    | 'parking site'
    | 'parking gate'
    | 'parking lot'
    | 'hardware'
    | 'parking block'
    | 'parking floor';

  @IsNotEmpty()
  asignee: number;

  @IsOptional()
  assignedUser?: number;
}
