import { Body, Controller, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { FocPaginatedDto } from './dto/foc-paginated.dto';
import { FocService } from './foc.service';

@Controller('api/foc')
@UseGuards(JwtAuthGuard)
export class FocController {
  constructor(private readonly focService: FocService) {}

  @Post('/paginated')
  async paginated(
    @Body() dto: FocPaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.focService.paginated({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'FOC records fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
