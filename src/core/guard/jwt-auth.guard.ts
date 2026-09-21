import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppConfiguration } from '../config/app.configuration';
import { jwtConstants } from './guard-constants';

const fernet = require('fernet');

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private appConfiguration: AppConfiguration,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: [`unauthenticated user`],
          error: 'unauthenticated user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
      return true;
    } catch (jwtError) {
      try {
        const legacyKey = 'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws=';
        const secret = new fernet.Secret(legacyKey);
        const legacyToken = new fernet.Token({
          secret,
          token,
          ttl: 0,
        });
        const legacyPayload = JSON.parse(legacyToken.decode());

        request['user'] = legacyPayload;
        return true;
      } catch {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: [`unauthenticated user`],
            error: 'unauthenticated user',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
