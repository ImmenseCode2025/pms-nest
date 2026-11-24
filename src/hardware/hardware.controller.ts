import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthId } from 'src/core/decorators/auth-id.decorator';
import { Public } from 'src/core/guard/public.decorator';
import { ResponseHelper } from 'src/core/helper/response.helper';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { DeviceIssuanceListDto } from './dto/device-issuance-list.dto';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
import { HardwarePaginatedDto } from './dto/hardware-paginated.dto';
import { TagHardwareDto } from './dto/tag-hardware.dto';
import { UntagHardwareDto } from './dto/untag-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';
import { HardwareService } from './hardware.service';

@Controller('api/hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  // Device issuance table (all hardware types). Query: { page, limit|pageSize, search? }
  // -> { results: [{ id, partName, configuration, description, type, status, userId, user,
  //      asignee (parking site id), assignedUser, createdAt, updatedAt, uniqueId,
  //      hardwareUsers: { username } | null, hardwareAssignedUsers: { name } | null,
  //      assignDetails: { name } (parking site) | null }], total, page, meta, links }
  @Get('/device-issuance')
  async deviceIssuanceList(
    @Query() dto: DeviceIssuanceListDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.hardwareService.deviceIssuanceList(dto);
      return ResponseHelper.success({
        res,
        data,
        message: 'Hardware list fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Issue new hardware (+ assign log). Body: { partName, configuration, description, type,
  // asignee (parking site id), assignedUser }. 400 if configuration (ipOrApi) already exists.
  @Post('/device-issuance')
  async deviceIssuanceCreate(
    @Body() dto: CreateHardwareDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.hardwareService.deviceIssuanceCreate(dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Hardware created successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Re-assign / update hardware (only sent fields) + always writes an assign log.
  @Put('/device-issuance/:id')
  async deviceIssuanceUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHardwareDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.hardwareService.deviceIssuanceUpdate(id, dto, authId);
      return ResponseHelper.success({
        res,
        data,
        message: 'Hardware updated successfully.',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

  // Assignee dropdown for device issuance (parking sites) -> [{ id, name }]
  @Get('/assignees')
  async assignees(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.hardwareService.assignees();
      return ResponseHelper.success({
        res,
        data,
        message: 'Hardware assignees fetched successfully',
      });
    } catch (error) {
      return ResponseHelper.error({ res, req, error });
    }
  }

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
    @Body() dto: UntagHardwareDto,
    @Req() req: Request,
    @Res() res: Response,
    @AuthId() authId: number,
  ) {
    try {
      const data = await this.hardwareService.untagHandheld(id, dto, authId);
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
