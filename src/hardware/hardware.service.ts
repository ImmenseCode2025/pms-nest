import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LodashHelper } from 'src/core/helper/lodash-helper';
import { HardwareAssignLogs } from 'src/core/orm/entities/hardware-assign-logs.entity';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { HardwareAssigneesDto } from './dto/hardware-assignees.dto';
import { HardwareDropdownDto } from './dto/hardware-dropdown.dto';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
import { HardwarePaginatedDto } from './dto/hardware-paginated.dto';
import { TagHardwareDto } from './dto/tag-hardware.dto';
import { UntagHardwareDto } from './dto/untag-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Injectable()
export class HardwareService {
  async dropdown(dto: HardwareDropdownDto = {}) {
    const query = Hardware.query()
      .select('id', 'ipOrApi as configuration', 'type', 'status', 'asignee')
      .orderBy('id', 'desc');
    if (dto.type) {
      query.where('type', dto.type);
    }
    return await query;
  }

  // Karachi (KMC) company id, same as parking-sites/site-dropdown
  private static readonly KMC_COMPANY_ID = 7;

  async assignees(dto: HardwareAssigneesDto) {
    const knex = Hardware.knex();
    const companyId = HardwareService.KMC_COMPANY_ID;

    switch (dto.assigned_to) {
      case 'parking site':
        return await knex('parking_site')
          .select('id', 'name')
          .where('company', companyId)
          .orderBy('name', 'asc');

      case 'parking block': {
        const rows = await knex('parking_block as pb')
          .innerJoin('parking_site as ps', 'ps.id', 'pb.site')
          .select('pb.id', 'pb.name', 'ps.name as site_name')
          .where('ps.company', companyId)
          .orderBy('pb.name', 'asc');
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          parkingBlockParkingSite: { name: r.site_name },
        }));
      }

      case 'parking gate': {
        const rows = await knex('parking_gate as pg')
          .innerJoin('parking_block as pb', 'pb.id', 'pg.block')
          .innerJoin('parking_site as ps', 'ps.id', 'pb.site')
          .select('pg.id', 'pg.name', 'pb.name as block_name', 'ps.name as site_name')
          .where('ps.company', companyId)
          .orderBy('pg.name', 'asc');
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          parkingBlockParkingGate: {
            name: r.block_name,
            parkingBlockParkingSite: { name: r.site_name },
          },
        }));
      }

      case 'hardware':
        return await knex('hardware')
          .select('id', 'sku as name')
          .orderBy('id', 'desc');

      default:
        return [];
    }
  }

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
          .where('sku', 'like', `%${dto.search}%`)
          .orWhere('uniqueId', 'like', `%${dto.search}%`)
          .orWhere('ipOrApi', 'like', `%${dto.search}%`)
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

  async untagHandheld(id: number, dto: UntagHardwareDto, authId?: number) {
    const existing: any = await Hardware.query().findById(id);
    if (!existing) {
      throw new HttpException('Hardware not found', HttpStatus.NOT_FOUND);
    }

    const updatedHardware = await Hardware.query().patchAndFetchById(id, {
      asignee: null,
    });

    const description =
      dto?.description ||
      'Handheld hardware untagged from site';

    await HardwareAssignLogs.query().insertAndFetch({
      hardware: id,
      assignee: dto?.siteId || existing.asignee || 0,
      user: authId || null,
      assignTo: 'unassigned',
      description,
      assignedUser: null,
    });

    return updatedHardware;
  }

  async tagHandheld(id: number, dto: TagHardwareDto, authId?: number) {
    const existing: any = await Hardware.query().findById(id);
    if (!existing) {
      throw new HttpException('Hardware not found', HttpStatus.NOT_FOUND);
    }

    const payload: any = {
      asignee: dto.siteId,
      assignedTo: 'parking site',
    };
    if (dto.assignedUser !== undefined) {
      payload.assignedUser = dto.assignedUser;
    }

    const updatedHardware = await Hardware.query().patchAndFetchById(id, payload);

    const description =
      dto?.description ||
      'Handheld hardware tagged to site';

    await HardwareAssignLogs.query().insertAndFetch({
      hardware: id,
      assignee: dto.siteId,
      user: authId || null,
      assignTo: 'parking site',
      description,
      assignedUser: dto.assignedUser || null,
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
