import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CorporateCardsService } from './corporate-cards.service';
import { CorporateCardsPaginatedDto } from './dto/corporate-cards-paginated.dto';

@Controller('api/corporate-cards')
export class CorporateCardsController {
  constructor(private readonly corporateCardsService: CorporateCardsService) {}

  // LIST (POST)
  @Public()
  @Post('/list')
  async list(
    @Body() dto: CorporateCardsPaginatedDto,
    @Query() query: any,
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
}
