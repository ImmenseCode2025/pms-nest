import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCorporateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  registrationNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  contactPersonName: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  address?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  unitPrice?: number;

  @IsOptional()
  @IsString()
  status?: 'pending' | 'approved' | 'rejected';
}
