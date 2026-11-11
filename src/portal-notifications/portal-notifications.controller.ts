import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { PortalNotificationListDto } from './dto/portal-notification-list.dto';
import { PortalNotificationReadAllDto } from './dto/portal-notification-read-all.dto';
import { PortalNotificationsService } from './portal-notifications.service';

@Controller('api/portal-notifications')
export class PortalNotificationsController {
  constructor(private readonly service: PortalNotificationsService) {}

  // Query: { portalType? } -> { notifications: [...], count, unreadCount }
  @Get('/')
  async list(
    @Query() dto: PortalNotificationListDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.service.list(dto, authId);
      return ResponseHelper.success({ res, data, message: 'Notifications fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Body (or query): { portalType?, userId?, corporateId? }. Declared before the ':id' routes.
  @Put('/read-all')
  async markAllAsRead(
    @Body() dto: PortalNotificationReadAllDto,
    @Query() query: PortalNotificationReadAllDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.service.markAllAsRead({ ...(query || {}), ...(dto || {}) }, authId);
      return ResponseHelper.success({ res, data, message: 'All notifications marked as read' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Put('/:id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.service.markAsRead(id, authId);
      return ResponseHelper.success({ res, data, message: 'Notification marked as read' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Soft delete (sets deletedAt)
  @Delete('/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.service.remove(id, authId);
      return ResponseHelper.success({ res, data, message: 'Notification deleted successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
