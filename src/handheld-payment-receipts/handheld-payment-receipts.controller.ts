import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  OperatorAuth,
  OperatorAuthId,
} from 'src/core/decorators/jwt-auth.decorator';
import { OperatorJwtAuthGuard } from 'src/core/guard/operator-jwt-auth.guard';
import { Public } from 'src/core/guard/public.decorator';
import { FileExtensionsEnum } from 'src/core/helper/enum/global.enum';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { InterceptorHelper } from 'src/core/interceptors/files-interceptor';
import {
  AddHandheldReceiptDto,
  TicketEaseDto,
} from './dto/add-handheld-receipt.dto';
import { ShiftSummaryDto } from './dto/shift-summary.dto';
import { HandheldPaymentReceiptsService } from './handheld-payment-receipts.service';

@Controller('api/handheld-payment-receipts')
export class HandheldPaymentReceiptsController {
  constructor(
    private readonly handheldPaymentReceiptsService: HandheldPaymentReceiptsService,
  ) {}

  @Public()
  // @UseGuards(OperatorJwtAuthGuard)
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
    @OperatorAuthId() operatorId: number,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.add(
        files,
        dto,
        operatorId,
      );
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
  // @UseGuards(OperatorJwtAuthGuard)
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
    @OperatorAuthId() operatorId: number,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.ticketCheckout(
        files,
        dto,
        operatorId,
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
      const data =
        await this.handheldPaymentReceiptsService.checkOutBatch(file);
      return ResponseHelper.success({
        res,
        data,
        message: data.message,
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @OperatorAuth()
  @Post('/shift-summary')
  async shiftSummary(
    @Body() dto: ShiftSummaryDto,
    @Req() req: Request,
    @Res() res: Response,
    @OperatorAuthId() operatorId: number,
  ) {
    try {
      const data = await this.handheldPaymentReceiptsService.getShiftSummary(
        dto,
        operatorId,
      );
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
