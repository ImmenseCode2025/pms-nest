import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import fs from 'fs';
import handlebars from 'handlebars';
import moment from 'moment';
import { join } from 'path';
import { AppCacheService } from 'src/core/app-cache/app-cache.service';
import { AppConfiguration } from 'src/core/config/app.configuration';
import { AppException } from 'src/core/exception/app-exception';
import { jwtConstants } from 'src/core/guard/guard-constants';
import {
  ErrorLogsUrlEnum,
  PlatformEnum,
  RedisKeysEnum,
} from 'src/core/helper/enum/global.enum';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { DeviceTokens } from 'src/core/orm/entities/device-tokens.entity';
import { ErrorLogs } from 'src/core/orm/entities/error-logs.entity';
import { Users } from 'src/core/orm/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import {
  AppleLoginDto,
  ChangePasswordDto,
  CreateAccountDto,
  GoogleLoginDto,
  LogInAdminDto,
  LogInDto,
  NewPasswordDto,
  UpdateFcmDto,
  VerifyMobileNumberDto,
  VerifyMobileNumberOtpDto,
} from './dto/auth.dto';
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private appConfiguration: AppConfiguration,
    private readonly mailService: MailerService,
    private eventEmitter: EventEmitter2,
    private readonly appCacheService: AppCacheService,
    private readonly usersService: UsersService,
  ) {}

  async verifyMobileNumber(dto: VerifyMobileNumberDto) {
    try {
      let user: any = await Users.query()
        .where({ phone_number: dto.phone_number, is_deleted: 0 })
        .first();
      if (user) {
        AppException.badRequest({ message: 'Phone number already exists' });
      }
      let otp = await GlobalHelper.generateOtp();

      await this.appCacheService.set({
        key: `${RedisKeysEnum.VerifyMobileNumber}${dto.phone_number}`,
        value: {
          phone_number: dto.phone_number,
          otp: otp,
          verified: false,
        },
        ttl: 60 * 60,
      });
      return otp;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async loginAdmin(dto: LogInAdminDto, req) {
    let user: any = await Users.query().where({ email: dto.email }).first();
    if (!user) {
      throw new HttpException(
        'The email you entered could not be found. Please check and try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if ((await bcrypt.compare(dto.password, user.password)) != true) {
      throw new HttpException(
        'The username or password you entered is incorrect. Please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      token: await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      user_details: user,
    };
  }
  async login(dto: LogInDto) {
    try {
      let user: any = await Users.query()
        .where({ phone_number: dto.phone_number, is_deleted: 0 })
        .first();
      if (!user) {
        AppException.badRequest({
          message: 'Phone number not found in the system',
        });
      }

      if (!user.is_verified) {
        AppException.badRequest({
          message: 'Please verify your phone number',
        });
      }
      if (user.is_verified && !user.password) {
        AppException.badRequest({
          message:
            'Please create your account first your phone number is verified ',
        });
      }

      if ((await bcrypt.compare(dto.password, user.password)) != true) {
        AppException.badRequest({
          message:
            'The username or password you entered is incorrect. Please try again',
        });
      }
      await GlobalHelper.updateDeviceToken({
        userId: user.id,
        deviceId: dto.device_id,
        token: dto.token,
      });

      return {
        token: await this.jwtService.signAsync({
          id: user.id,
          email: user.email,
          role: user.role,
        }),
        user_details: user,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @OnEvent('sent_otp')
  async sendOtp({ userId, email }) {
    try {
      const templatePath = join(
        process.cwd(),
        'html-templates',
        'verification-code.html',
      );
      let otp = await GlobalHelper.generateOtp();
      await Users.query()
        .patch({
          otp: otp,
          updated_at: moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
        })
        .where({ id: userId });

      const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(htmlTemplate);
      const htmlContent = compiledTemplate({
        otp: otp,
      });
      await this.mailService.sendMail({
        from: 'TIC ROCK Koderspedia <admin@koderspedia.net>',
        to: email,
        subject: `TIC ROCK OTP`,
        html: htmlContent,
      });
      return true;
    } catch (error) {
      await ErrorLogs.query().insertAndFetch({
        user_id: userId,
        method: 'Post',
        status_code: 400,
        url: ErrorLogsUrlEnum.SendingOtp,
        error: error,
      });
    }
  }

  async newPassword(dto: NewPasswordDto, req) {
    const payload = await this.jwtService.verifyAsync(dto.token, {
      secret: jwtConstants.secret,
    });

    if (!payload) {
      throw new HttpException('invalid token.', HttpStatus.BAD_REQUEST);
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    let item: any = await Users.query().updateAndFetchById(payload?.id, {
      password: passwordHash,
    });
    return item;
  }

  async changePassword(dto: ChangePasswordDto, authId: number) {
    let user: any = await Users.query().findById(authId);
    if ((await bcrypt.compare(dto.old_password, user.password)) != true) {
      throw new HttpException(
        'The old password you entered is incorrect. Please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const passwordHash = await bcrypt.hash(dto.new_password, 10);
    let item: any = await Users.query().updateAndFetchById(user.id, {
      password: passwordHash,
    });
    return item;
  }

  async verifyMobileNumberOtp(dto: VerifyMobileNumberOtpDto) {
    let cacheData: any = await this.appCacheService.get({
      key: `${RedisKeysEnum.VerifyMobileNumber}${dto.phone_number}`,
    });
    if (!cacheData) {
      AppException.badRequest({
        message: 'OTP Expired kindly resend the OTP',
      });
    }
    if (cacheData.otp != dto.otp) {
      AppException.badRequest({
        message: 'Invalid OTP',
      });
    }
    let result: any = await Users.query().insertAndFetch({
      otp: null,
      is_verified: true,
      phone_number: dto.phone_number,
      auth_platform: PlatformEnum.App,
    });
    return {
      token: this.jwtService.sign({
        id: result.id,
        phone_number: dto.phone_number,
      }),
      user_details: result,
    };
  }

  async updateFcm(dto: UpdateFcmDto, req) {
    await GlobalHelper.updateDeviceToken({
      userId: req.user.id,
      deviceId: dto.device_id,
      token: dto.token,
    });
    return true;
  }

  async createAccount(dto: CreateAccountDto, authId) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    let item: any = await Users.query().updateAndFetchById(authId, {
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      user_name: dto.user_name,
      profile_image: dto.profile_image,
      password: passwordHash,
      auth_platform: PlatformEnum.App,
      bio: dto.bio,
      country: dto.country,
      state: dto.state,
      city: dto.city,
    });

    await DeviceTokens.query().insertAndFetch({
      user_id: item.id,
      device_id: dto.device_id,
      token: dto.token,
    });
    return item;
  }

  async googleLogin(dto: GoogleLoginDto) {
    let item: any = {};
    let userExist: any = await Users.query()
      .where({ email: dto.email, is_deleted: 0 })
      .first();
    if (!userExist) {
      item = await Users.query().insertAndFetch({
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        platform_token: dto.google_token,
        auth_platform: PlatformEnum.Google,
        verified: true,
      });
    }
    if (userExist) {
      item = await Users.query().updateAndFetchById(userExist.id, {
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        platform_token: dto.google_token,
        auth_platform: PlatformEnum.Google,
        verified: true,
      });
    }

    await DeviceTokens.query().insertAndFetch({
      user_id: item.id,
      device_id: dto.device_id,
      token: dto.token,
    });
    return {
      token: this.jwtService.sign({
        id: item.id,
        email: item.email,
      }),
      user_details: item,
    };
  }

  async appleLogin(dto: AppleLoginDto) {
    try {
      const decoded = jwt.decode(dto.apple_token, { complete: true });
      let data: any = decoded?.payload;
      const value = data?.sub.substring(0, data?.sub.indexOf('.'));
      let userExist: any = await Users.query()
        .where({
          platform_token: data.sub,
          is_deleted: 0,
        })
        .first();
      let item: any = {};
      if (!userExist) {
        item = await Users.query().insertAndFetch({
          first_name: dto.first_name ?? value,
          last_name: dto.last_name ?? value,
          email: data?.email ?? value,
          platform_token: data.sub,
          auth_platform: PlatformEnum.Apple,
          verified: true,
        });
      }
      if (userExist) {
        item = await Users.query().updateAndFetchById(userExist.id, {
          first_name: dto.first_name ?? value,
          last_name: dto.last_name ?? value,
          email: data?.email ?? value,
          platform_token: data.sub,
          auth_platform: PlatformEnum.Apple,
          verified: true,
        });
      }

      let user: any = await Users.query().findById(item.id);
      await DeviceTokens.query().insertAndFetch({
        user_id: item.id,
        device_id: dto.device_id,
        token: dto.token,
      });
      return {
        token: this.jwtService.sign({
          id: item.id,
          email: item.email,
        }),
        user_details: item,
      };
    } catch (error) {
      throw new HttpException(
        'There is an error. Please check and try again.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
