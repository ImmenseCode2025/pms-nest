import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CorporateFinanceService } from './corporate-finance.service';
import { CreateBillingPlanDto } from './dto/create-billing-plan.dto';
import { DeclinePaymentDto } from './dto/decline-payment.dto';
import { GenerateCorporateInvoiceDto } from './dto/generate-invoice.dto';

/**
 * Admin-side corporate finance (migrated from legacy cda-parking-chat-backend /api/corporate-finance).
 * The corporate-portal routes (/api/corporate-finance/my/*) are NOT part of this module.
 */
@Controller('api/corporate-finance')
export class CorporateFinanceController {
  constructor(private readonly service: CorporateFinanceService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get('/dashboard/stats')
  async stats(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.getDashboardStats();
      return ResponseHelper.success({ res, data, message: 'Corporate finance stats fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Unpaid invoices (issued/pending/overdue/declined). Query: page, pageSize, corporateId?, periodStart?, periodEnd?
  @Get('/dashboard/pending-generation')
  async pendingGeneration(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.getPendingInvoices(query);
      return ResponseHelper.success({ res, data, message: 'Pending invoices fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // ─── Billing plans ─────────────────────────────────────────────────────────

  @Post('/billing-plans')
  async createBillingPlan(@Body() dto: CreateBillingPlanDto, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.createBillingPlan(dto);
      return ResponseHelper.success({ res, data, message: 'Billing plan created' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // ─── Invoices (static routes before parameterized) ─────────────────────────

  // Query: periodStart, periodEnd (required), page?, pageSize?
  @Get('/invoices/unbilled-corporates')
  async unbilledCorporates(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.getUnbilledCorporates(query);
      return ResponseHelper.success({ res, data, message: 'Unbilled corporates fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/invoices/generate')
  async generateInvoice(
    @Body() dto: GenerateCorporateInvoiceDto,
    @AuthId() authId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.service.generateInvoice(dto, authId ?? null);
      return ResponseHelper.success({ res, data, message: 'Invoice generated and issued' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Query: page, pageSize, status?, corporateId?
  @Get('/invoices')
  async invoices(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.getAllInvoices(query);
      return ResponseHelper.success({ res, data, message: 'Invoices fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Get('/invoices/:id')
  async invoiceDetail(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.getInvoiceById(id);
      return ResponseHelper.success({ res, data, message: 'Invoice fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Delete('/invoices/:id')
  async deleteInvoice(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.deleteInvoice(id);
      return ResponseHelper.success({ res, data, message: 'Invoice deleted' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // ─── Payments ──────────────────────────────────────────────────────────────

  @Get('/invoices/:id/payments')
  async payments(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.service.getPaymentsByInvoice(id);
      return ResponseHelper.success({ res, data, message: 'Payments fetched successfully' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Streams the receipt file (not the JSON envelope). Errors still return the JSON error envelope.
  @Get('/invoices/:id/payments/:paymentId/receipt')
  async receipt(
    @Param('id', ParseIntPipe) id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.service.downloadPaymentReceipt(id, paymentId, res);
    } catch (error) {
      if (res.headersSent) {
        res.end();
        return;
      }
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('/invoices/:id/payments/:paymentId/approve')
  async approvePayment(
    @Param('id', ParseIntPipe) id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @AuthId() authId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.service.approvePayment(id, paymentId, authId ?? null);
      return ResponseHelper.success({ res, data, message: 'Payment approved' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('/invoices/:id/payments/:paymentId/decline')
  async declinePayment(
    @Param('id', ParseIntPipe) id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() dto: DeclinePaymentDto,
    @AuthId() authId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.service.declinePayment(id, paymentId, dto?.reason ?? null, authId ?? null);
      return ResponseHelper.success({ res, data, message: 'Payment declined' });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
