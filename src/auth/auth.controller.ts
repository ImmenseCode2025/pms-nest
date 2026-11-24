import { Body, Controller, Ip, Post, Put, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from 'src/core/exception/app-exception';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { AuthService } from './auth.service';
import {
  EmployeeLoginDto,
  LoginDto,
  OperatorLoginDto,
  SendEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.login(loginDto, ip);
      return ResponseHelper.success({
        res,
        data,
        message: 'Login successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('operator-login')
  async operatorLogin(
    @Body() dto: OperatorLoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.operatorLogin(dto);
      return res.status(200).json(data);
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('employee-login')
  async employeeLogin(
    @Body() dto: EmployeeLoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.employeeLogin(dto);
      return res.status(200).json(data);
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('parkingSystem/login')
  async parkingSystemLogin(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.login(loginDto, ip);
      return res.status(200).json(data);
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('send-email')
  async sendEmail(
    @Body() dto: SendEmailDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.sendEmail(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Email sent successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Forgot password (Flask parkingSystem/forgotPassword). Body: { email }
  // Emails a reset link to an active admin; always returns the same message.
  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.forgotPassword(dto);
      return ResponseHelper.success({ res, data, message: data.message });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Reset password (Flask parkingSystem/resetPassword). Body: { token, password }
  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.authService.resetPassword(dto);
      return ResponseHelper.success({ res, data, message: data.message });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Change own password (Flask parkingSystem/changePassword).
  // Body: { oldPassword, newPassword }
  @Put('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Customer tokens also pass the global guard; this route is for user-table accounts only
      if ((req as any).user?.role === 'customer') {
        AppException.forbidden({ message: 'Not allowed' });
      }
      const data = await this.authService.changePassword(req['userId'], dto);
      return ResponseHelper.success({ res, data, message: data.message });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
