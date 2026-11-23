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
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CreatePosDeviceDto } from './dto/create-pos-device.dto';
import { PosDevicePaginatedDto } from './dto/pos-device-paginated.dto';
import { UpdatePosDeviceDto } from './dto/update-pos-device.dto';
import { PosDevicesService } from './pos-devices.service';

@Controller('api/pos-devices')
export class PosDevicesController {
  constructor(private readonly posDevicesService: PosDevicesService) {}

  @Post('/create')
  async create(
    @Body() dto: CreatePosDeviceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.posDevicesService.create(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'POS device created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/paginated')
  async paginated(
    @Body() dto: PosDevicePaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.posDevicesService.paginated({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'POS devices retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Get('/detail/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.posDevicesService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'POS device fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('/update')
  async update(
    @Body() dto: UpdatePosDeviceDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.posDevicesService.update(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'POS device updated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Delete('delete/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.posDevicesService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'POS device deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
