import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateIf,
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

  // If latitude is provided, longitude is also required (and vice versa)
  @ValidateIf((o) => o.longitude !== undefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ValidateIf((o) => o.latitude !== undefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
