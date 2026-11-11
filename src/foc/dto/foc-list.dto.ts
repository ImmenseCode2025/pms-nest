import { IsOptional, IsString } from 'class-validator';

// Body for POST foc/list and POST foc/qr-codes. Query: { page, limit }
export class FocListDto {
  @IsOptional()
  @IsString()
  search?: string;
}
