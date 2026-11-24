import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SearchPaymentsDto } from './dto/search-payments.dto';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Ticket payments (Flask parkingApp/searchPayments).
  // Query: { page, limit, search?, location? ('karachi' default) }
  // Response data: { results: [{ id, tokenNumber, amount, date, time,
  //   category, paymentGateway, status }], total, page, meta, links }
  @Get('/search')
  async search(
    @Query() dto: SearchPaymentsDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.paymentsService.search(dto, query);
      return ResponseHelper.success({
        res,
        data,
        message: 'Payments fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
