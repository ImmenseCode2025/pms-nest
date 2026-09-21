import { SetMetadata } from '@nestjs/common';
import { jwtConstants } from './guard-constants';
import { UserRole } from './user-role.enum';

export const UserRoles = (...roles: UserRole[]) =>
  SetMetadata(jwtConstants.roles_key, roles);
