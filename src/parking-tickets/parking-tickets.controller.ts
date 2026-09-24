import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { ParkingTicketsPaginatedDto } from './dto/parking-tickets-paginated.dto';
import { ParkingTicketsService } from './parking-tickets.service';

@Controller('api/parking-tickets')
export class ParkingTicketsController {
  constructor(private readonly parkingTicketsService: ParkingTicketsService) {}

  @Post('/paginated')
  async paginated(
    @Body() dto: ParkingTicketsPaginatedDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query,
  ) {
    try {
      const data = await this.parkingTicketsService.paginated({
        dto,
        req,
        query,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Fetched Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/parking-tickets-pdf')
  async parkingTicketsPdf(
    @Body() dto: ParkingTicketsPaginatedDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const url = await this.parkingTicketsService.parkingTicketsPdf(dto);
      return ResponseHelper.success({
        res,
        data: { url },
        message: 'PDF Generated Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/parking-tickets-excel')
  async parkingTicketsExcel(
    @Body() dto: ParkingTicketsPaginatedDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const url = await this.parkingTicketsService.parkingTicketsExcel(dto);
      return ResponseHelper.success({
        res,
        data: { url },
        message: 'Excel Generated Successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
