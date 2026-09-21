import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SentPopupNotificationDto } from './dto/create-notification.dto';
import { FcmHelper } from './notification.fcm';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/paginated')
  async paginated(
    @Query() query,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.notificationsService.pagination({
        query,
        req,
        res,
        authId,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Successfully Fetched',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/seen-all')
  @UseInterceptors(FileInterceptor(''))
  async seenMyNotification(
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data =
        await this.notificationsService.seenMyAllNotifications(authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Seen Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Delete('/delete/:id')
  @UseInterceptors(FileInterceptor(''))
  async deleteMySingleNotification(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.notificationsService.delete(id, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Deleted Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/sent-popup-notification')
  @UseInterceptors(FileInterceptor(''))
  async sentPopupNotification(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: SentPopupNotificationDto,
  ) {
    try {
      const data = await FcmHelper.sendMessageNotification({
        deviceTokens: [dto.device_token],
        data: {},
        notification: {
          title: dto.title,
          body: dto.text,
        },
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'sent Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
