import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsMatch } from 'src/core/decorators/match.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @Matches(/^\d{13}$/, { message: 'CNIC Number must be exactly 13 digits' })
  cnic: string;

  @IsNotEmpty()
  @IsIn(['employee', 'admin'])
  access: 'employee' | 'admin';

  @IsNotEmpty()
  @IsInt()
  site: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsMatch('password', { message: 'Confirm password must match password' })
  confirmPassword: string;

  @IsOptional()
  @IsString()
  profile?: string;

  @IsNotEmpty()
  location?: string;

  @IsNotEmpty()
  latitude?: number;

  @IsNotEmpty()
  longitude?: number;
}
