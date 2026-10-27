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
import { CreateOperatorDto } from './dto/create-operator.dto';
import { OperatorPaginatedDto } from './dto/operator-paginated.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { OperatorsService } from './operators.service';

@Controller('api/operators')
@UseGuards(JwtAuthGuard)
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  // 1. CREATE
  @Post('create')
  async create(
    @Body() dto: CreateOperatorDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.operatorsService.create(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Operator created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 2. PAGINATED LISTING
  @Post('/paginated')
  async paginated(
    @Body() dto: OperatorPaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.operatorsService.paginated({ dto, query, req });
      return ResponseHelper.success({
        res,
        data,
        message: 'Operators retrieved successfully',
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
      const data = await this.operatorsService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Operator fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 4. UPDATE
  @Patch('update')
  async update(
    @Body() dto: UpdateOperatorDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.operatorsService.update(dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Operator updated successfully',
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
      const data = await this.operatorsService.delete(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Operator deleted successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 6. GET AVAILABLE PASSWORDS
  @Get('get-passwords')
  async getPasswords(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.operatorsService.getPasswords();
      return ResponseHelper.success({
        res,
        data,
        message: 'Available password retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
