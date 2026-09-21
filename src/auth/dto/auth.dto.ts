export class CreateAuthDto {}
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { IsMatch } from 'src/core/decorators/match.decorator';

export class LogInAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
export class LogInDto {
  @IsNotEmpty()
  phone_number: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  token: string;
}

export class CreateAccountDto {
  @IsNotEmpty()
  user_name: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  bio: string;

  @IsNotEmpty()
  country: string;

  @IsOptional()
  state: string;

  @IsNotEmpty()
  city: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsMatch('password')
  confirm_password: string;

  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  token: string;

  @IsOptional()
  profile_image: string;
}

export class VerifyMobileNumberOtpDto {
  @IsNotEmpty()
  phone_number: string;

  @IsNotEmpty()
  otp: string;
}

export class VerifyMobileNumberDto {
  @IsNotEmpty()
  phone_number: string;
}

export class NewPasswordDto {
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsMatch('password')
  confirm_password: string;

  @IsNotEmpty()
  token: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  old_password: string;

  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character.',
    },
  )
  new_password: string;

  @IsNotEmpty()
  @IsMatch('new_password')
  confirm_new_password: string;
}

export class UpdateFcmDto {
  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  token: string;
}

export class GoogleLoginDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  google_token: string;
}

export class AppleLoginDto {
  @IsOptional()
  first_name: string;

  @IsOptional()
  last_name: string;

  @IsOptional()
  email: string;

  @IsNotEmpty()
  device_id: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  apple_token: string;
}
