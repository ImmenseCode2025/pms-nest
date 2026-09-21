import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { AuthService } from './auth.service';
import {
  AppleLoginDto,
  ChangePasswordDto,
  CreateAccountDto,
  GoogleLoginDto,
  LogInAdminDto,
  LogInDto,
  UpdateFcmDto,
  VerifyMobileNumberDto,
  VerifyMobileNumberOtpDto,
} from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login-admin')
  @UseInterceptors(FileInterceptor(''))
  async loginAdmin(
    @Body() obj: LogInAdminDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.loginAdmin(obj, req);
      return ResponseHelper.success({
        res,
        data,
        message: 'Login Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/login')
  @UseInterceptors(FileInterceptor(''))
  async login(
    @Body() obj: LogInDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.login(obj);
      return ResponseHelper.success({
        res,
        data,
        message: 'Login Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/verify-mobile-number')
  @UseInterceptors(FileInterceptor(''))
  async verifyMobileNumber(
    @Body() obj: VerifyMobileNumberDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.verifyMobileNumber(obj);
      return ResponseHelper.success({
        res,
        data,
        message: 'Otp Send Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/verify-mobile-number-otp')
  @UseInterceptors(FileInterceptor(''))
  async verifyMobileNumberOtp(
    @Body() obj: VerifyMobileNumberOtpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.verifyMobileNumberOtp(obj);
      return ResponseHelper.success({
        res,
        data,
        message: 'Verify Otp Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/create-account')
  @UseInterceptors(FileInterceptor(''))
  async createAccount(
    @Body() obj: CreateAccountDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.authService.createAccount(obj, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Account Created Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/change-password')
  @UseInterceptors(FileInterceptor(''))
  async changePassword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() obj: ChangePasswordDto,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.authService.changePassword(obj, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Change Password Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/update-fcm')
  @UseInterceptors(FileInterceptor(''))
  async updateFcm(
    @Body() dto: UpdateFcmDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.updateFcm(dto, req);
      return ResponseHelper.success({
        res,
        data,
        message: 'Update Fcm Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/google-login')
  @UseInterceptors(FileInterceptor(''))
  async googleLogin(
    @Body() obj: GoogleLoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.googleLogin(obj);
      return ResponseHelper.success({
        res,
        data,
        message: 'Login Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/apple-login')
  @UseInterceptors(FileInterceptor(''))
  async appleLogin(
    @Body() obj: AppleLoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.appleLogin(obj);
      return ResponseHelper.success({
        res,
        data,
        message: 'Login Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
