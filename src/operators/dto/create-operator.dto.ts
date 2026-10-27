import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UniqueOnDatabase } from 'src/core/decorators/unique.validation';
import { Operator } from 'src/core/orm/entities';

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
  @UniqueOnDatabase(Operator)
  password: string;

  @IsOptional()
  profile_image?: string;

}
