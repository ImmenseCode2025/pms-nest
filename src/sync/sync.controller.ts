import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SyncService } from './sync.service';

/**
 * Site servers (realpark) k liye public sync API — sirf SYNC_TABLES wale tables.
 *   GET /api/sync/:table?after_id=0&limit=500
 *     after_id=0  -> poori list (pehli sync)
 *     after_id=N  -> N k baad ki changes
 *   e.g. GET /api/sync/corporates?after_id=0
 */
@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Public()
  @Get('/:table')
  async changes(
    @Param('table') table: string,
    @Query('after_id') afterId: string,
    @Query('limit') limit: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.syncService.changes(table, Number(afterId) || 0, Number(limit) || 500);
      return ResponseHelper.success({ res, data, message: 'Sync changes retrieved successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
