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
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { JwtAuthGuard } from 'src/core/guard/jwt-auth.guard';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { VehicleTypePaginatedDto } from './dto/vehicle-type-paginated.dto';
import { VehicleTypesService } from './vehicle-types.service';

@Controller('api/vehicle-types')
@UseGuards(JwtAuthGuard)
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  // 1. CREATE
  @Post('create')
  async create(
    @Body() dto: CreateVehicleTypeDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.vehicleTypesService.create(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Vehicle type created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 1b. REGISTER (Flask parkingApp/registerVehicleType). Body: { name }
  // Lowercases the name and rejects duplicates.
  @Post('register')
  async register(
    @Body() dto: CreateVehicleTypeDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.vehicleTypesService.register(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Vehicle Type Registered Successfully!',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 2. PAGINATED LISTING
  @Post('/paginated')
  async paginated(
    @Body() dto: VehicleTypePaginatedDto,
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.vehicleTypesService.paginated({
        dto,
        query,
        req,
      });
      return ResponseHelper.success({
        res,
        data,
        message: 'Vehicle types retrieved successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 3. DROPDOWN
  @Public()
  @Get('/dropdown')
  async dropdown(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.vehicleTypesService.dropdown();
      return ResponseHelper.success({
        res,
        data,
        message: 'Vehicle types dropdown fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 4. READ BY ID
  @Get('/detail/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.vehicleTypesService.findOne(id);
      return ResponseHelper.success({
        res,
        data,
        message: 'Vehicle type fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // 5. UPDATE
  @Patch('update')
  async update(
    @Body() dto: UpdateVehicleTypeDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.vehicleTypesService.update(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Vehicle type updated successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }
}
