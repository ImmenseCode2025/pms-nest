import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { AppException } from 'src/core/exception/app-exception';
import { Operator } from 'src/core/orm/entities';
import { UserAccessToken } from 'src/core/orm/entities/user-access-token.entity';
import { Users } from 'src/core/orm/entities/users.entity';
import { jwtConstants } from 'src/core/guard/guard-constants';
import {
  ChangePasswordDto,
  EmployeeLoginDto,
  ForgotPasswordDto,
  LoginDto,
  OperatorLoginDto,
  ResetPasswordDto,
  SendEmailDto,
} from './dto/auth.dto';

const fernet = require('fernet');
export const FERNET_KEY = 'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws=';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generates a 16-character alphanumeric random token,
   * saves it into user_access_token table,
   * and encrypts it using Fernet key (identical to Flask backend).
   */
  async generateAuthCode(
    userId: number,
    macAddress: string = '0.0.0.0',
  ): Promise<string> {
    const length = 16;
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    while (true) {
      token = '';
      for (let i = 0; i < length; i++) {
        token += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      const existing = await UserAccessToken.query()
        .where('token', token)
        .first();
      if (!existing) {
        break;
      }
    }

    // Insert into user_access_token table
    await UserAccessToken.query().insert({
      user: userId,
      token: token,
      macAddress: macAddress || '0.0.0.0',
      status: 'active',
    });

    // Encrypt token with Fernet
    const secret = new fernet.Secret(FERNET_KEY);
    const tokenObj = new fernet.Token({
      secret,
      time: Date.now(),
    });
    return tokenObj.encode(token);
  }

  /**
   * Verifies password using Fernet decryption (Flask pattern) or direct match
   */
  private verifyPassword(
    storedPassword: string,
    inputPassword: string,
  ): boolean {
    if (!storedPassword) return false;
    if (storedPassword === inputPassword) return true;

    try {
      const secret = new fernet.Secret(FERNET_KEY);
      const tokenObj = new fernet.Token({
        secret,
        token: storedPassword,
        ttl: 0,
      });
      const decrypted = tokenObj.decode();
      return decrypted === inputPassword;
    } catch {
      return false;
    }
  }

  /**
   * Validates user email/password (shared by Fernet login and employee JWT login)
   */
  private async validateUserCredentials(email: string, password: string) {
    // Find user by email
    const user: any = await Users.query().where('email', email.trim()).first();

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Invalid Email!'],
          error: 'Invalid Email!',
          errors: [{ email: 'invalid' }],
          response: 'failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.isDeleted === 1 || user.status === 'inactive') {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['User is inactive.'],
          error: 'User is inactive.',
          errors: [{ email: 'inactive' }],
          response: 'failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify Password
    const isPasswordValid = this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Incorrect Password'],
          error: 'Incorrect Password',
          errors: [{ password: 'invalid' }],
          response: 'failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  /**
   * Login API matching Flask parkingSystem login logic
   */
  async login(loginDto: LoginDto, clientIp: string = '0.0.0.0') {
    const { email, password, ipAddress, macAddress } = loginDto;
    const user = await this.validateUserCredentials(email, password);

    // Generate Flask compatible Fernet token
    const token = await this.generateAuthCode(
      user.id,
      macAddress || ipAddress || clientIp,
    );

    const userInfo = {
      id: user.id,
      name: user.username,
      email: user.email,
      token: token,
      profile: user.profile
        ? `https://smartparkings.com.pk/admin/userProfileImages/${user.profile}`
        : '',
      access: user.access,
      site: user.site,
    };

    return {
      message: 'Successfully Logged In',
      token,
      userInfo,
      response: 'success',
      errors: [],
    };
  }
  /**
   * Employee login - same credential check as login, but returns a JWT
   */
  async employeeLogin(loginDto: EmployeeLoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUserCredentials(email, password);

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      access: user.access,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiry as any,
    });

    return {
      message: 'Successfully Logged In',
      token,
      userInfo: {
        id: user.id,
        name: user.username,
        email: user.email,
        profile: user.profile
          ? `https://smartparkings.com.pk/admin/userProfileImages/${user.profile}`
          : '',
        access: user.access,
        site: user.site,
      },
      response: 'success',
      errors: [],
    };
  }

  async operatorLogin(loginDto: OperatorLoginDto) {
    const { pin } = loginDto;
    const operator: any = await Operator.query().where('password', pin).first();
    if (!operator) {
      AppException.badRequest({ message: 'Invalid PIN or Operator not found' });
    }
    if (operator.password != pin) {
      AppException.badRequest({ message: 'Invalid PIN' });
    }
    const payload = {
      id: operator.id,
      username: operator.username,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      token: token,
      operator: operator,
    };
  }

  // ─── PASSWORD RESET / CHANGE (ported from Flask admin backend) ──────────────

  private encryptPassword(password: string): string {
    const secret = new fernet.Secret(FERNET_KEY);
    return new fernet.Token({ secret }).encode(password);
  }

  private get passwordResetTtl(): number {
    return parseInt(process.env.PASSWORD_RESET_TOKEN_TTL || '1800', 10);
  }

  // Same payload/format as Flask generatePasswordResetToken, so links issued
  // by either backend stay valid on the other. Embedding the current
  // encrypted password makes the link single-use (it stops matching once
  // the password changes).
  private generatePasswordResetToken(userId: number, encryptedPassword: string) {
    const payload = JSON.stringify({
      userId,
      password: String(encryptedPassword),
      purpose: 'password-reset',
    });
    const secret = new fernet.Secret(FERNET_KEY);
    return new fernet.Token({ secret }).encode(payload);
  }

  private async validatePasswordResetToken(token: string): Promise<number | null> {
    try {
      const secret = new fernet.Secret(FERNET_KEY);
      const decoded = new fernet.Token({
        secret,
        token,
        ttl: this.passwordResetTtl,
      }).decode();
      const payload = JSON.parse(decoded);
      if (payload?.purpose !== 'password-reset') return null;

      const user: any = await Users.query()
        .select('id', 'password')
        .where('id', payload.userId)
        .where('access', 'admin')
        .where('isDeleted', 0)
        .first();
      if (!user) return null;
      if (String(user.password) !== payload.password) return null;
      return user.id;
    } catch {
      return null;
    }
  }

  /**
   * Forgot password: emails a reset link (<PASSWORD_RESET_URL>?token=...) to an
   * active admin. Always answers with the same generic message so the route
   * cannot be used to discover which emails exist.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim();
    const user: any = await Users.query()
      .select('id', 'username', 'password')
      .where('email', email)
      .where('access', 'admin')
      .where('isDeleted', 0)
      .first();

    if (user) {
      const resetToken = this.generatePasswordResetToken(user.id, user.password);
      const resetUrl =
        process.env.PASSWORD_RESET_URL ||
        'https://smartparkings.com.pk/admin/reset-password';
      const resetLink = `${resetUrl}?token=${encodeURIComponent(resetToken)}`;
      const escape = (s: string) =>
        String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      const html =
        `<p>Hi ${escape(user.username ?? '')},</p>` +
        '<p>We received a request to reset your password.</p>' +
        `<p><a href="${escape(resetLink)}">Reset password</a></p>` +
        `<p>This link expires in ${Math.floor(this.passwordResetTtl / 60)} minutes. ` +
        'If you did not request this, you can ignore this email.</p>';

      await this.sendEmail({
        to: email,
        subject: 'PMS ADMIN PASSWORD RESET',
        html,
      });
    }

    return {
      response: 'success',
      message:
        'If an active admin account exists for this email, a password reset link has been sent.',
      errors: [],
    };
  }

  /**
   * Reset password with the emailed token. Also expires every access token of
   * the user (logs them out everywhere), like Flask.
   */
  async resetPassword(dto: ResetPasswordDto) {
    const userId = await this.validatePasswordResetToken(dto.token);
    if (!userId) {
      AppException.badRequest({
        message: 'Password reset token is invalid or expired.',
      });
    }

    await Users.query()
      .patch({ password: this.encryptPassword(dto.password) })
      .where('id', userId);
    await UserAccessToken.query()
      .patch({ status: 'expired' } as any)
      .where('user', userId);

    return { response: 'success', message: 'Password Updated Successfully!', errors: [] };
  }

  /**
   * Change password of the logged-in user (old password must match).
   */
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user: any = await Users.query()
      .select('id', 'password')
      .findById(userId);
    if (!user) {
      AppException.notFound({ message: 'User not found' });
    }
    if (!this.verifyPassword(user.password, dto.oldPassword)) {
      AppException.badRequest({ message: 'Invalid Password!' });
    }

    await Users.query()
      .patch({ password: this.encryptPassword(dto.newPassword) })
      .where('id', userId);

    return { response: 'success', message: 'Password Changed Successfully!', errors: [] };
  }

  /**
   * Public sendEmail method using MailerService
   */
  async sendEmail(dto: SendEmailDto) {
    let htmlContent = dto.html;

    if (dto.otp) {
      const templatePath = path.join(
        process.cwd(),
        'html-templates',
        'verification-code.html',
      );
      if (fs.existsSync(templatePath)) {
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(htmlTemplate);
        htmlContent = compiledTemplate({
          otp: dto.otp,
        });
      }
    }

    const fromUser = process.env.MAIL_USERNAME || 'noreply@immensecode.ai';
    const info = await this.mailService.sendMail({
      from: `"PMS" <${fromUser}>`,
      to: dto.to,
      subject: dto.subject,
      html: htmlContent,
    });

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      to: dto.to,
      subject: dto.subject,
    };
  }
}
