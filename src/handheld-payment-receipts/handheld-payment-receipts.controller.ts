import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { FileExtensionsEnum } from 'src/core/helper/enum/global.enum';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { InterceptorHelper } from 'src/core/interceptors/files-interceptor';
import {
  AddHandheldReceiptDto,
  TicketEaseDto,
} from './dto/add-handheld-receipt.dto';
import { HandheldPaymentReceiptsService } from './handheld-payment-receipts.service';

@Controller('api/handheld-payment-receipts')
export class HandheldPaymentReceiptsController {
  constructor(
    private readonly handheldPaymentReceiptsService: HandheldPaymentReceiptsService,
  ) {}

  @Public()
  @UseInterceptors(
    InterceptorHelper.s3GlobalFileInterceptorMultiple({
      fieldNames: [{ name: 'onlinePaymentReference' }],
      validations: { onlinePaymentReference: FileExtensionsEnum.All },
    }),
  )
  @Post('/handheld-add')
  async addHandheld(
    @Body() dto: AddHandheldReceiptDto,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.add(files, dto);
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
  @UseInterceptors(
    InterceptorHelper.s3GlobalFileInterceptorMultiple({
      fieldNames: [{ name: 'onlinePaymentReference' }],
      validations: { onlinePaymentReference: FileExtensionsEnum.All },
    }),
  )
  @Post('/ticket-checkout')
  async ticketCheckout(
    @Body() dto: TicketEaseDto,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.ticketCheckout(
        files,
        dto,
      );
      return ResponseHelper.success({
        res,
        data,
        message: 'Ticket checkout successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @UseInterceptors(
    InterceptorHelper.globalFileInterceptorForCsv({ fieldName: 'file' }),
  )
  @Post('/:source/batch')
  async batch(
    @UploadedFile() file: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.batch(file);
      return ResponseHelper.success({
        res,
        data,
        message: data.message,
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @UseInterceptors(
    InterceptorHelper.globalFileInterceptorForCsv({ fieldName: 'file' }),
  )
  @Post('/handheld-batch')
  async handheldBatch(
    @UploadedFile() file: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.batch(file);
      return ResponseHelper.success({
        res,
        data,
        message: data.message,
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @UseInterceptors(
    InterceptorHelper.globalFileInterceptorForCsv({ fieldName: 'file' }),
  )
  @Post('/check-out-batch')
  async checkOutBatch(
    @UploadedFile() file: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.checkOutBatch(file);
      return ResponseHelper.success({
        res,
        data,
        message: data.message,
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}




