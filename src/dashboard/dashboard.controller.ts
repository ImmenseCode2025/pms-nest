import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  async getDashboardData(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.dashboardService.getDashboardData();
      return ResponseHelper.success({
        res,
        data,
        message: 'Fetched Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
