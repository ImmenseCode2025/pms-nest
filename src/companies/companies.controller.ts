import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CompaniesService } from './companies.service';
import { CompaniesDropdownDto } from './dto/companies-dropdown.dto';

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // Dropdown list: [{ id, name }]. Query: { city? }
  @Get('/dropdown')
  async dropdown(
    @Query() dto: CompaniesDropdownDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.companiesService.dropdown(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Companies dropdown fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
