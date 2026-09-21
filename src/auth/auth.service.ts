import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppCacheService } from 'src/core/app-cache/app-cache.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly appCacheService: AppCacheService,
  ) {}
}
