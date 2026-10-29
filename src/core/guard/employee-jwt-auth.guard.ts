import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './guard-constants';

@Injectable()
export class EmployeeJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Unauthenticated employee - missing Bearer token'],
          error: 'Unauthenticated employee',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Invalid or expired employee token'],
          error: 'Unauthenticated employee',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Operator tokens share the same secret, so reject non-employee tokens
    if (payload?.type !== 'employee') {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Token is not an employee token'],
          error: 'Unauthenticated employee',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Attach decoded JWT to request
    request['user'] = payload;
    request['employee'] = payload;
    return true;
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
