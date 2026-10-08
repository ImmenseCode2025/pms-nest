import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LodashHelper } from 'src/core/helper/lodash-helper';
import { HardwareAssignLogs } from 'src/core/orm/entities/hardware-assign-logs.entity';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
import { HardwarePaginatedDto } from './dto/hardware-paginated.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Injectable()
export class HardwareService {
  async getHandheldList(dto?: HardwareFilterDto) {
    const query = Hardware.query();
    query.select('id', 'ipOrApi', 'type', 'status', 'asignee');
    query.where('type', 'handheld');
    query.where('asignee', dto?.siteId);
    query.withGraphFetched('Hardware_site');
    query.orderBy('id', 'desc');
    return await Hardware.findAllCustom(query);
  }

  async paginated(data: any = {}) {
    const dto: HardwarePaginatedDto = data.dto || {};
    const query = Hardware.query();
    query.where('type', 'handheld');
    if (dto?.siteId) {
      query.where('asignee', dto?.siteId);
    }
    if (dto.search) {
      query.where((builder) => {
        builder
          .where('partName', 'like', `%${dto.search}%`)
          .orWhere('uniqueId', 'like', `%${dto.search}%`)
          .orWhere('description', 'like', `%${dto.search}%`);
      });
    }

    query.withGraphFetched('[Hardware_site,hardware_user]');
    query.orderBy('id', 'desc');

    return await Hardware.pagination(query, data);
  }

  async create(data: { dto: CreateHardwareDto; userId?: number }) {
    const { dto, userId } = data;

    const payload: any = {
      sku: dto.sku || dto.partName || null,
      description: dto.description || null,
      ipOrApi: dto.ipOrApi || dto.configuration || null,
      type: dto.type || null,
      status: dto.status || 'inactive',
      user: userId || null,
      assignedTo: dto.assignedTo,
      asignee: dto.asignee,
      assignedUser: dto.assignedUser || null,
      uniqueId: dto.uniqueId || null,
    };

    const newHardware: any = await Hardware.query().insertAndFetch(payload);

    // Create hardware assign log
    await HardwareAssignLogs.query().insert({
      hardware: newHardware.id,
      assignee: dto.asignee,
      user: userId || null,
      assignTo: dto.assignedTo,
      description: dto.description || '',
      assignedUser: dto.assignedUser || null,
    });

    return newHardware;
  }

  async update(id: number, dto: UpdateHardwareDto, userId?: number) {
    const existing: any = await Hardware.query().findById(id);
    if (!existing) {
      throw new HttpException('Hardware not found', HttpStatus.NOT_FOUND);
    }

    const payload: any = {
      sku: dto.sku || dto.partName || null,
      description: dto.description || null,
      ipOrApi: dto.ipOrApi || dto.configuration || null,
      type: dto.type || null,
      status: dto.status || 'inactive',
      user: userId || null,
      assignedTo: dto.assignedTo,
      asignee: dto.asignee,
      assignedUser: dto.assignedUser || null,
      uniqueId: dto.uniqueId || null,
    };

    const updatedHardware = await Hardware.query().patchAndFetchById(id, payload);

    // If assignment changed, record assign log using LodashHelper
    if (this.hasAssignmentChange(dto)) {
      await HardwareAssignLogs.query().insertAndFetch({
        hardware: id,
        assignee: LodashHelper.get(dto, 'asignee', existing.asignee),
        user: userId || null,
        assignTo: LodashHelper.get(dto, 'assignedTo', existing.assignedTo),
        description: LodashHelper.get(dto, 'description', existing.description || ''),
        assignedUser: LodashHelper.get(dto, 'assignedUser', existing.assignedUser || null),
      });
    }

    return updatedHardware;
  }

  async untagHandheld(id: number, authId?: number) {
    const existing: any = await Hardware.query().findById(id);
    if (!existing) {
      throw new HttpException('Hardware not found', HttpStatus.NOT_FOUND);
    }

    const updatedHardware = await Hardware.query().patchAndFetchById(id, {
      asignee: null,
      assignedTo: null,
      assignedUser: null,
    });

    await HardwareAssignLogs.query().insertAndFetch({
      hardware: id,
      assignee: existing.asignee || 0,
      user: authId || null,
      assignTo: 'unassigned',
      description: 'Handheld hardware untagged from site',
      assignedUser: null,
    });

    return updatedHardware;
  }

  private hasAssignmentChange(dto: UpdateHardwareDto): boolean {
    return (
      LodashHelper.get(dto, 'asignee') !== undefined ||
      LodashHelper.get(dto, 'assignedTo') !== undefined ||
      LodashHelper.get(dto, 'assignedUser') !== undefined
    );
  }
}
