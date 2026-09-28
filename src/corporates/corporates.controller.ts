import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CorporatesService } from './corporates.service';

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
