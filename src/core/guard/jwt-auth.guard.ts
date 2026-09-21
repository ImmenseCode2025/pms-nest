import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserAccessToken } from '../orm/entities/user-access-token.entity';
import { UserRole } from './user-role.enum';

const fernet = require('fernet');
const FERNET_KEY = 'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws=';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

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
        // Agar already decrypted raw token ho
      }

      // 2. user_access_token table se check karo (using Objection Entity)
      const userToken = await UserAccessToken.query()
        .where('token', decryptedToken)
        .where((qb) => {
          qb.where('status', 'active').orWhere('status', 1);
        })
        .withGraphFetched('user_detail')
        .first();

      if (userToken && userToken.user_detail && !userToken.user_detail.isDeleted) {
        const user = userToken.user_detail;
        request['user'] = {
          ...user,
          id: user.id,
          role: user.access === 'admin' ? UserRole.Admin : UserRole.User,
        };
        request['userId'] = user.id;
        return true;
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
