import { Body, Controller, Ip, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';

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
}
