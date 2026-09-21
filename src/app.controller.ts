import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { Public } from './core/guard/public.decorator';
import { ResponseHelper } from './core/helper/response.helper';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  async getHello(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.appService.getHello();
      return ResponseHelper.success({
        res,
        data,
        message: 'success',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
