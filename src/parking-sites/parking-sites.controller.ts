import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { SearchParkingSitesDto } from './dto/search-parking-sites.dto';
import { ParkingSitesService } from './parking-sites.service';

@Controller('api/parking-sites')
export class ParkingSitesController {
  constructor(private readonly parkingSitesService: ParkingSitesService) {}

  @Public()
  @Get('/dropdown')
  async dropdown(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.parkingSitesService.dropdown();
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking sites dropdown fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Post('/dropdown')
  async dropdownPost(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.parkingSitesService.dropdown();
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking sites dropdown fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Post('/paginated')
  async paginated(
    @Body() dto: SearchParkingSitesDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query,
  ) {
    try {
      const data = await this.parkingSitesService.paginated({
        dto,
        req,
        query,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Fetched Successfully',
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
      const data = await this.parkingSitesService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking site and related configuration deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  @Public()
  @Get('/dropdown')
  async dropdown(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.parkingSitesService.dropdown();
      return ResponseHelper.success({
        res,
        data,
        message: 'Parking sites dropdown fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

}
