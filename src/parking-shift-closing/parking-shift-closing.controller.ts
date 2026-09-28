import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { ParkingShiftClosingService } from './parking-shift-closing.service';

@Controller('api/shift-closing')
export class ParkingShiftClosingController {
  constructor(
    private readonly parkingShiftClosingService: ParkingShiftClosingService,
  ) {}

  @Get('/detail/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.parkingShiftClosingService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Shift closing detail retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Delete Complete Shift Closing (Main Record + Details + History)
  @Delete('/delete/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.parkingShiftClosingService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Shift closing and all associated records deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
