import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from 'src/core/guard/guard-constants';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = parseInt(config.get('MAIL_PORT') || '587', 10);
        const username = config.get('MAIL_USERNAME') || 'noreply@immensecode.ai';
        const password = config.get('MAIL_PASSWORD') || 'sydzrthbxgcgkkdt';
        const host = config.get('MAIL_HOST') || 'smtp.office365.com';

        return {
          transport: {
            host,
            port,
            secure: port === 465,
            auth: {
              user: username,
              pass: password,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"PMS" <${username}>`,
          },
        };
      },
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
    }),
  ],


  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
