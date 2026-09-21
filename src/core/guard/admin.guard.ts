import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppException } from '../exception/app-exception';
import { IS_ADMIN_KEY } from './admin.decorator';
import { UserRole } from './user-role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!isAdmin) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (user && user.role === UserRole.Admin) {
            return true;
        }

        AppException.unauthorized({ message: 'Admin access required' });
        return false;
    }
}
