import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SiteMonitorService } from './site-monitor.service';

@Controller('api/site-monitor')
export class SiteMonitorController {
  constructor(private readonly siteMonitorService: SiteMonitorService) {}

  // Screen ki pehli load; uske baad updates socket 'site-status' event sy
  @Get('/')
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.siteMonitorService.list();
      return ResponseHelper.success({
        res,
        data,
        message: 'Site connectivity fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
