// src/common/guards/csrf.guard.ts
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request, Response } from 'express';
import { doubleCsrfProtection } from './csrf.util';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return Promise.resolve(true); // ✅ skip CSRF for @Public()
    }

    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    return new Promise((resolve, reject) => {
      doubleCsrfProtection(req, res, (err) => {
        if (err) {
          reject(
            new HttpException(
              {
                statusCode: HttpStatus.UNAUTHORIZED,
                message: [`Session Expired Please login in again.`],
                error: 'Session Expired Please login in again.',
              },
              HttpStatus.UNAUTHORIZED,
            ),
          );
        } else {
          resolve(true);
        }
      });
    });
  }
}
