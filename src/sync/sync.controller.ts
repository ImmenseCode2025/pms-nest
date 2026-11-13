import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SyncDto } from './dto/sync.dto';
import { SyncService } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Public()
  @Post('/corporates')
  async corporates(
    @Body() body: SyncDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.syncService.corporates(
        body.site_id,
        body.after_id,
        body.limit,
      );
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporates sync retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Local `vip_vehicles` k liye — company_id = corporate id
  @Public()
  @Post('/corporate-cards')
  async corporateCards(
    @Body() body: SyncDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.syncService.corporateCards(
        body.site_id,
        body.after_id,
        body.limit,
      );
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate cards sync retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
