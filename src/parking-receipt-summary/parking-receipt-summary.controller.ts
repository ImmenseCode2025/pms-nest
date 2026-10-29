import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { ParkingReceiptSummaryPaginatedDto } from './dto/parking-receipt-summary-paginated.dto';
import { ParkingReceiptSummaryService } from './parking-receipt-summary.service';

@Controller('api/parking-receipt-summary')
@UseGuards(JwtAuthGuard)
export class ParkingReceiptSummaryController {
  constructor(
    private readonly parkingReceiptSummaryService: ParkingReceiptSummaryService,
  ) {}

  // 1. PAGINATED LISTING
  @Post('/paginated')
  async paginated(
    @Body() dto: ParkingReceiptSummaryPaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.parkingReceiptSummaryService.paginated({
        dto,
        query,
        req,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking receipt summaries retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 2. READ BY ID
  @Get('/detail/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.parkingReceiptSummaryService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking receipt summary fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 3. DELETE
  @Delete('/delete/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.parkingReceiptSummaryService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking receipt summary deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
