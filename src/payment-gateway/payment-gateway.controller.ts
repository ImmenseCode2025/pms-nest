import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { PaymentGatewayPaginatedDto } from './dto/payment-gateway-paginated.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';
import { PaymentGatewayService } from './payment-gateway.service';

@Controller('api/payment-gateways')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  // 1. CREATE
  @Post('create')
  async create(
    @Body() dto: CreatePaymentGatewayDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.paymentGatewayService.create(dto, req);
      return ResponseHelper.success({
        res,
        data,
        message: 'Payment gateway created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 2. PAGINATED
  @Post('/paginated')
  async paginated(
    @Body() dto: PaymentGatewayPaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.paymentGatewayService.paginated({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'Payment gateways retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 3. READ BY ID
  @Get('/detail/:id')
  async findOne(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.paymentGatewayService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Payment gateway fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 4. UPDATE
  @Patch('update')
  async update(
    @Body() dto: UpdatePaymentGatewayDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.paymentGatewayService.update(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Payment gateway updated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 5. DELETE
  @Delete('/delete/:id')
  async delete(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.paymentGatewayService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Payment gateway deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
