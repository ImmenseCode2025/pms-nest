import { IsIn, IsOptional, IsString } from 'class-validator';

export class UsersPaginatedDto {
  // Matches username, email, contact or CNIC
  @IsOptional()
  @IsString()
  search?: string;

  // Filter by role; omit (or send empty) for all
  @IsOptional()
  @IsIn(['admin', 'employee', ''])
  access?: 'admin' | 'employee' | '';
}
