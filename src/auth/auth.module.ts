import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from 'src/core/guard/guard-constants';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    MailerModule.forRoot({
      transport: {
        port: 587,
        host: 'smtp.hostinger.com',
        secure: false,
        auth: {
          user: 'admin@koderspedia.net',
          pass: 'zSlQ$DTUSzk@1',
        },
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
