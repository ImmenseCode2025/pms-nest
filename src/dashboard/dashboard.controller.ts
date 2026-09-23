import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('admin')
  async getDashboardData(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: DashboardFilterDto,
  ) {
    try {
      const data = await this.dashboardService.getDashboardData(dto);
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
