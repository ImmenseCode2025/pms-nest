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
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CorporatesService } from './corporates.service';
import { CreateCorporateDto } from './dto/create-corporate.dto';
import { CorporatePaginatedDto } from './dto/corporate-paginated.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { UpdateCorporateDto } from './dto/update-corporate.dto';

@Controller('api/corporates')
@UseGuards(JwtAuthGuard)
export class CorporatesController {
  constructor(private readonly corporatesService: CorporatesService) {}

  // 1. CREATE
  @Post('create')
  async create(
    @Body() dto: CreateCorporateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.create(dto, req);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 2. PAGINATED LISTING
  @Post('/paginated')
  async paginated(
    @Body() dto: CorporatePaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.paginated({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporates retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 3. READ BY ID
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

  // 4. UPDATE
  @Patch('update')
  async update(
    @Body() dto: UpdateCorporateDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.corporatesService.update(dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Corporate updated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 5. DELETE
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

  @Post('/generate-invoice')
  async generateInvoice(
    @Body() dto: GenerateInvoiceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.corporatesService.generateInvoice(dto, req);
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
}

