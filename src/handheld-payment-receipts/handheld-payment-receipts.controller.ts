import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseInterceptors
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { AddHandheldReceiptDto, TicketEaseDto } from './dto/add-handheld-receipt.dto';
import { HandheldPaymentReceiptsService } from './handheld-payment-receipts.service';

@Controller('api/handheld-payment-receipts')
export class HandheldPaymentReceiptsController {
  constructor(
    private readonly handheldPaymentReceiptsService: HandheldPaymentReceiptsService,
  ) {}

  
  @Public()
  @UseInterceptors(NoFilesInterceptor())
  @Post('/handheld-add')
  async addHandheld(
    @Body() dto: AddHandheldReceiptDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.add(dto);
      return ResponseHelper.success({
        res,
        data, 
        message: 'Handheld payment receipt created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @UseInterceptors(NoFilesInterceptor())
  @Post('/ticket-checkout')
  async ticketCheckout(
    @Body() dto: TicketEaseDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.ticketEase(dto);
      return ResponseHelper.success({
        res,
        data, 
        message: 'Handheld payment receipt created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
