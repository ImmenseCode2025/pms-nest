import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SyncDto } from './dto/sync.dto';
import { TokensPushDto } from './dto/tokens-push.dto';
import { SyncService } from './sync.service';
import { TokensPushService } from './tokens-push.service';

@Controller('api/sync')
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly tokensPush: TokensPushService,
  ) {}

  // Site server -> live: local `tokens` -> `parking_token` (upsert by uuid + version)
  // Public hai magar `x-sync-key` header = .env SYNC_PUSH_KEY zaroori (prod table mein likhta hai)
  @Public()
  @Post('/tokens/push')
  async tokensPushRoute(
    @Body() body: TokensPushDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const syncKeyError = this.validateSyncKey(req);
      if (syncKeyError) {
        return ResponseHelper.error({
          res,
          req,
          error: new Error(syncKeyError),
          errorCode: HttpStatus.UNAUTHORIZED,
        });
      }
      const data = await this.tokensPush.push(body.site_id, body.records);
      return ResponseHelper.success({ res, data, message: 'Tokens pushed successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

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

  @Public()
  @Post('/operators')
  async operators(
    @Body() body: SyncDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.syncService.operators(
        body.site_id,
        body.after_id,
        body.limit,
      );
      return ResponseHelper.success({
        res,
        data,
        message: 'Operators sync retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // `x-sync-key` header ko .env SYNC_PUSH_KEY se match karta hai. Theek ho to null, warna error message.
  private validateSyncKey(req: Request): string | null {
    const key = process.env.SYNC_PUSH_KEY;
    if (!key) return 'SYNC_PUSH_KEY is not configured';
    if (req.headers['x-sync-key'] !== key) return 'Invalid sync key';
    return null;
  }
}
