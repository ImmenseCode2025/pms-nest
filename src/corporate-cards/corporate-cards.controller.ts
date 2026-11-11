import { Body, Controller, Get, Put, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CorporateCardsService } from './corporate-cards.service';
import { CorporateCardsPaginatedDto } from './dto/corporate-cards-paginated.dto';
import { CorporateCardBulkDecisionDto } from './dto/corporate-card-bulk-decision.dto';
import {
  CorporateCardQrCodesQueryDto,
  CorporateCardRequestsQueryDto,
} from './dto/corporate-card-requests-query.dto';

@Controller('api/corporate-cards')
export class CorporateCardsController {
  constructor(private readonly corporateCardsService: CorporateCardsService) {}

  // LIST (POST)
  @Public()
  @Get('/list')
  async list(
    @Query() dto: CorporateCardsPaginatedDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporateCardsService.list(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate cards retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Corporate card requests (legacy GET corporate-cards).
  // Query: page, pageSize, search, group ('true' => grouped by requestId), location (ignored).
  // Response data: { count, data, page, pageSize, totalPages }
  @Get()
  async findAllRequests(
    @Query() dto: CorporateCardRequestsQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporateCardsService.findAllRequests(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate card requests retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Corporate card QR code usage (legacy GET corporate-cards/qr-codes).
  // Query: page, pageSize, search, location (ignored).
  // Response data: { count, data, page, pageSize, totalPages }
  @Get('/qr-codes')
  async findAllQrCodes(
    @Query() dto: CorporateCardQrCodesQueryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporateCardsService.findAllQrCodes(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate card QR codes retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Approve/reject cards in bulk (legacy PUT corporate-cards/bulk-decision).
  // Body: { approveIds: number[], rejectIds: number[], approvedBy?, approvalRemarks? }
  @Put('/bulk-decision')
  async bulkDecision(
    @Body() dto: CorporateCardBulkDecisionDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.corporateCardsService.bulkDecision(dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate card decision applied successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
