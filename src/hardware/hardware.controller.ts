import {
  Controller,
  Get,
  Query,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
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

  
}
