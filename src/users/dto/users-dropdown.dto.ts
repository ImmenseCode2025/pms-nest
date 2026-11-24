import { IsIn, IsOptional } from 'class-validator';

export class UsersDropdownDto {
  // Filter by role; omit for all non-deleted users
  @IsOptional()
  @IsIn(['admin', 'employee', 'supervisor'])
  access?: 'admin' | 'employee' | 'supervisor';
}
