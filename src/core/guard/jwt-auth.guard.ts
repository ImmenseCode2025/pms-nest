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
import { Model } from 'objection';
import { AppConfiguration } from '../config/app.configuration';
import { jwtConstants } from './guard-constants';
import { UserRole } from './user-role.enum';

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
        HttpStatus.UNAUTHORIZED,
      );
    }

        console.log(token ,'sssssssssss')

    // 1. Try standard JWT verification
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      payload
              console.log(payload ,'payload')

      request['user'] = payload;
      return true;
    } catch (jwtError) {
      // 2. Try Flask Fernet token decryption
      try {
        const legacyKey = 'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws=';
        const secret = new fernet.Secret(legacyKey);
        const legacyToken = new fernet.Token({
          secret,
          token,
          ttl: 0,
        });
        const decodedRaw = legacyToken.decode();

        // Check if decoded is JSON payload
        let payload: any = null;
        try {
          payload = JSON.parse(decodedRaw);
        } catch {
          payload = null;
        }

        if (payload && (payload.id || payload.userId)) {

          console.log(payload ,'payload')
          // const userId = payload.id || payload.userId;
          // const knex = Model.knex();
          // const user = await knex('user').where('id', userId).where('isDeleted', 0).first();
          // request['user'] = {
          //   ...(user || {}),
          //   ...payload,
          //   id: userId,
          //   role: (user?.access === 'admin' || payload.access === 'admin' || payload.role === 'admin') ? UserRole.Admin : UserRole.User,
          // };
          return true;
        }

        // Otherwise decodedRaw is a 16-character token string from Flask
        const rawToken = typeof decodedRaw === 'string' ? decodedRaw.trim() : String(decodedRaw);
        const knex = Model.knex();

        // Check user_access_token table
        const userTokenRecord = await knex('user_access_token')
          .where('token', rawToken)
          .where((qb) => {
            qb.where('status', 'active').orWhere('status', '1').orWhere('status', 1);
          })
          .first();

        if (userTokenRecord) {
          const user = await knex('user')
            .where('id', userTokenRecord.user)
            .where('isDeleted', 0)
            .first();

          if (!user) {
            throw new Error('User not found or deleted');
          }

          request['user'] = {
            ...user,
            id: user.id,
            role: user.access === 'admin' ? UserRole.Admin : UserRole.User,
          };
          return true;
        }

        // Check customer_access_token table
        const customerTokenRecord = await knex('customer_access_token')
          .where('token', rawToken)
          .where((qb) => {
            qb.where('status', 'active').orWhere('status', '1').orWhere('status', 1);
          })
          .first();

        if (customerTokenRecord) {
          const customer = await knex('customer')
            .where('id', customerTokenRecord.customer)
            .first();

          if (!customer) {
            throw new Error('Customer not found');
          }

          request['user'] = {
            ...customer,
            id: customer.id,
            role: 'customer',
          };
          return true;
        }

        throw new Error('Token not found in user_access_token or customer_access_token');
      } catch (err) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: [`unauthenticated user`],
            error: 'unauthenticated user',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

