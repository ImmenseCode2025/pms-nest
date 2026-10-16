import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CorporatesService } from './corporates.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Controller('api/corporates')
export class CorporatesController {
  constructor(private readonly corporatesService: CorporatesService) {}

  @Get('/detail/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate detail retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/generate-invoice')
  async generateInvoice(
    @Body() dto: GenerateInvoiceDto,
    @Req() req: Request,
    @Res() res: Response,
    
  ) {
    try {
      const data = await this.corporatesService.generateInvoice(dto,req);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate invoice generated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Get('/invoices/:id')
  async getInvoices(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.getInvoices(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate invoices retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Get('/invoice-pdf/:id')
  async invoicePdf(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.generateInvoicePdf(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate invoice PDF generated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Delete('/delete/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Pending corporate deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}

