import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;
}

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  otp?: string | number;
}

export class OperatorLoginDto {
  @IsNotEmpty()
  @IsString()
  pin: string;
}

export class EmployeeLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

// POST auth/forgot-password (public)
export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

// POST auth/reset-password (public). token = the Fernet token from the
// emailed reset link (?token=...)
export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

// PUT auth/change-password (logged-in user)
export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  newPassword: string;
}
