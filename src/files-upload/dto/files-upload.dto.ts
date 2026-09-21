import { IsNotEmpty, IsString } from 'class-validator';

export class FileUploadDto {
  @IsNotEmpty()
  @IsString()
  destination: string;
}
