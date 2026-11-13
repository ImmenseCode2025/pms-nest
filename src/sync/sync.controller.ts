import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SyncCorporatesDto } from './dto/sync-corporates.dto';
import { SyncService } from './sync.service';

/**
 * Site servers (realpark) k liye public corporates sync API — har site ko sirf apne corporates.
 *   POST /api/sync/corporates
 *   body: { "site_id": 3, "after_id": 0, "limit": 500 }
 *     after_id=0  -> is site ki poori list (pehli sync)
 *     after_id=N  -> N k baad ki changes
 */
@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Public()
  @Post('/corporates')
  async corporates(@Body() body: SyncCorporatesDto, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.syncService.corporates(body.site_id, body.after_id, body.limit);
      return ResponseHelper.success({ res, data, message: 'Corporates sync retrieved successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
