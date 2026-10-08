import {
  Body,
  Controller,
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
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
import { HardwarePaginatedDto } from './dto/hardware-paginated.dto';
import { TagHardwareDto } from './dto/tag-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';
import { HardwareService } from './hardware.service';

@Controller('api/hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Public()
  @Get('/handheld-list-by-site')
  async getHandheldList(
    @Query() dto: HardwareFilterDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.hardwareService.getHandheldList(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Handheld hardware list retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/handheld-paginated')
  async paginated(
    @Body() dto: HardwarePaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.hardwareService.paginated({
        dto,
        query,
        req,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Handheld hardware retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/create')
  async create(
    @Body() dto: CreateHardwareDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId:number
  ) {
    try {
      const data = await this.hardwareService.create({
        dto,
        userId: authId,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Hardware created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHardwareDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.hardwareService.update(id, dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Hardware updated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('/untag/:id')
  async untag(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.hardwareService.untagHandheld(id, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Handheld hardware untagged successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Patch('/tag/:id')
  async tag(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TagHardwareDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.hardwareService.tagHandheld(id, dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Handheld hardware tagged successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
