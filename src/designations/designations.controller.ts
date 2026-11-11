import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { DesignationsService } from './designations.service';

@Controller('api/designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  // Dropdown list: [{ id, name }]
  @Get('/dropdown')
  async dropdown(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.designationsService.dropdown();
      return ResponseHelper.success({
        res,
        data,
        message: 'Designations dropdown fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
