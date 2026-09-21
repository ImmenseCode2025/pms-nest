import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserAccessToken } from 'src/core/orm/entities/user-access-token.entity';
import { Users } from 'src/core/orm/entities/users.entity';
import { LoginDto } from './dto/auth.dto';

const fernet = require('fernet');
const FERNET_KEY = 'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws=';

@Injectable()
export class AuthService {
  /**
   * Generates a 16-character alphanumeric random token,
   * saves it into user_access_token table,
   * and encrypts it using Fernet key (identical to Flask backend).
   */
  async generateAuthCode(userId: number, macAddress: string = '0.0.0.0'): Promise<string> {
    const length = 16;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    while (true) {
      token = '';
      for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const existing = await UserAccessToken.query().where('token', token).first();
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
  private verifyPassword(storedPassword: string, inputPassword: string): boolean {
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
   * Login API matching Flask parkingSystem login logic
   */
  async login(loginDto: LoginDto, clientIp: string = '0.0.0.0') {
    const { email, password, ipAddress, macAddress } = loginDto;

    // Find user by email
    const user: any = await Users.query()
      .where('email', email.trim())
      .first();

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

    // Generate Flask compatible Fernet token
    const token = await this.generateAuthCode(user.id, macAddress || ipAddress || clientIp);

    const userInfo = {
      id: user.id,
      name: user.username,
      email: user.email,
      token: token,
      profile: user.profile ? `https://smartparkings.com.pk/admin/userProfileImages/${user.profile}` : '',
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
}
