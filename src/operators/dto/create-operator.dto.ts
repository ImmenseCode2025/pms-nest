import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOperatorDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  mobile: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  cnic: string;

  @IsNotEmpty()
  site_id: number;

  @IsNotEmpty()
  supervisor_id: number;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  profile_image?: string;

}
