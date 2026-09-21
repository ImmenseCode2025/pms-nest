import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CustomerAccessToken } from '../orm/entities/customer-access-token.entity';
import { Customer } from '../orm/entities/customer.entity';
import { UserAccessToken } from '../orm/entities/user-access-token.entity';
import { Users } from '../orm/entities/users.entity';
import { UserRole } from './user-role.enum';

const fernet = require('fernet');
const FERNET_KEY = 'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws=';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const rawToken = this.extractTokenFromHeader(request);

    if (!rawToken) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['unauthenticated user'],
          error: 'unauthenticated user',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // 1. Fernet token decrypt (Flask token)
      let decryptedToken = rawToken;
      try {
        const secret = new fernet.Secret(FERNET_KEY);
        const tokenObj = new fernet.Token({
          secret,
          token: rawToken,
          ttl: 0,
        });
        decryptedToken = tokenObj.decode();
      } catch (e) {
        // Raw token fallback
      }

      // 2. user_access_token table me check karo
      const userToken: any = await UserAccessToken.query()
        .where('token', decryptedToken)
        .where((qb) => {
          qb.where('status', 'active').orWhere('status', '1').orWhere('status', 1);
        })
        .first();

      if (userToken && userToken.user) {
        const user: any = await Users.query()
          .findById(userToken.user)
          .where('isDeleted', 0);

        if (user) {
          request['user'] = {
            ...user,
            id: user.id,
            role: user.access === 'admin' ? UserRole.Admin : UserRole.User,
          };
          request['userId'] = user.id;
          return true;
        }
      }

      // 3. customer_access_token table me check karo
      const customerToken: any = await CustomerAccessToken.query()
        .where('token', decryptedToken)
        .where((qb) => {
          qb.where('status', 'active').orWhere('status', '1').orWhere('status', 1);
        })
        .first();

      if (customerToken && customerToken.customer) {
        const customer: any = await Customer.query().findById(customerToken.customer);
        if (customer) {
          request['user'] = {
            ...customer,
            id: customer.id,
            role: 'customer',
          };
          request['userId'] = customer.id;
          return true;
        }
      }

      throw new Error('Invalid token');
    } catch (err) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['unauthenticated user'],
          error: 'unauthenticated user',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return authHeader.trim();
  }
}
