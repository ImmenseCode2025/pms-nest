import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LodashHelper } from 'src/core/helper/lodash-helper';
import { HardwareAssignLogs } from 'src/core/orm/entities/hardware-assign-logs.entity';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { AppException } from 'src/core/exception/app-exception';
import { CreateHardwareDto } from './dto/create-hardware.dto';
import { DeviceIssuanceListDto } from './dto/device-issuance-list.dto';
import { HardwareAssigneesDto } from './dto/hardware-assignees.dto';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
import { HardwarePaginatedDto } from './dto/hardware-paginated.dto';
import { TagHardwareDto } from './dto/tag-hardware.dto';
import { UntagHardwareDto } from './dto/untag-hardware.dto';
import { UpdateHardwareDto } from './dto/update-hardware.dto';

@Injectable()
export class HardwareService {
  async assignees(dto: HardwareAssigneesDto) {
    const knex = Hardware.knex();

    switch (dto.assigned_to) {
      case 'parking site':
        return await knex('parking_site')
          .select('id', 'name')
          .orderBy('name', 'asc');

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

  // ---------------------------------------------------------------------------
  // Device issuance screen (admin panel) — replaces legacy chat-backend
  // GET/POST/PUT /api/hardware. Rows use the legacy field names.
  // ---------------------------------------------------------------------------

  private static readonly DEVICE_ISSUANCE_SELECT = [
    'hardware.id',
    'hardware.sku as partName',
    'hardware.description',
    'hardware.ipOrApi as configuration',
    'hardware.type',
    'hardware.status',
    'hardware.user as userId',
    'hardware.assignedTo',
    'hardware.asignee',
    'hardware.assignedUser',
    'hardware.creationDateTime as createdAt',
    'hardware.updatedAt',
    'hardware.uniqueId',
    'cu.username as creatorUsername',
    'au.username as assignedUsername',
  ];

  // assignedTo -> table holding the assignee's name
  private static readonly ASSIGNEE_TABLES: Record<string, { table: string; nameCol: string }> = {
    'parking site': { table: 'parking_site', nameCol: 'name' },
    hardware: { table: 'hardware', nameCol: 'sku' },
  };

  private deviceIssuanceBaseQuery() {
    return Hardware.query()
      .select(HardwareService.DEVICE_ISSUANCE_SELECT)
      .leftJoin('user as cu', 'cu.id', 'hardware.user')
      .leftJoin('user as au', 'au.id', 'hardware.assignedUser');
  }

  // Attach assignDetails: { name } | null per row (batched per assignedTo type)
  private async attachAssignDetails(rows: any[]) {
    const knex = Hardware.knex();
    const idsByType: Record<string, Set<number>> = {};
    for (const r of rows) {
      if (!r.assignedTo || r.asignee == null) continue;
      (idsByType[r.assignedTo] ||= new Set()).add(Number(r.asignee));
    }
    const names: Record<string, Map<number, string>> = {};
    await Promise.all(
      Object.entries(idsByType).map(async ([type, ids]) => {
        const cfg = HardwareService.ASSIGNEE_TABLES[type];
        if (!cfg) return;
        try {
          const found = await knex(cfg.table)
            .select('id', `${cfg.nameCol} as name`)
            .whereIn('id', [...ids]);
          names[type] = new Map(found.map((f: any) => [Number(f.id), f.name]));
        } catch {
          // lookup failed -> assignDetails stays null
        }
      }),
    );
    return rows.map((r: any) => {
      const { creatorUsername, assignedUsername, ...row } = r;
      const name = names[r.assignedTo]?.get(Number(r.asignee));
      return {
        ...row,
        user: row.userId ?? null,
        hardwareUsers: creatorUsername != null ? { username: creatorUsername } : null,
        hardwareAssignedUsers: assignedUsername != null ? { name: assignedUsername } : null,
        assignDetails: name !== undefined ? { name } : null,
      };
    });
  }

  private async deviceIssuanceRow(id: number) {
    const row: any = await this.deviceIssuanceBaseQuery().where('hardware.id', id).first();
    if (!row) return null;
    const [mapped] = await this.attachAssignDetails([row?.toJSON ? row.toJSON() : row]);
    return mapped;
  }

  // Paginated list of ALL hardware types for the device issuance table
  async deviceIssuanceList(dto: DeviceIssuanceListDto = {}) {
    const page = Number(dto.page) > 0 ? Number(dto.page) : 1;
    const limitRaw = Number(dto.limit ?? dto.pageSize);
    const limit = limitRaw > 0 ? limitRaw : 10;
    const search = (dto.search || '').trim();

    const query = this.deviceIssuanceBaseQuery();

    if (search) {
      const like = `%${search}%`;
      query.where((b) => {
        b.where('hardware.sku', 'like', like)
          .orWhere('hardware.ipOrApi', 'like', like)
          .orWhere('au.username', 'like', like);
      });
    }

    query.orderBy('hardware.creationDateTime', 'desc').orderBy('hardware.id', 'desc');

    const data: any = await Hardware.pagination(query, { query: { page, limit } });
    data.results = await this.attachAssignDetails(
      (data.results || []).map((r: any) => (r?.toJSON ? r.toJSON() : r)),
    );
    return data;
  }

  // Create hardware + initial hardware_assign_logs row (legacy POST /api/hardware)
  async deviceIssuanceCreate(dto: CreateHardwareDto, authId?: number) {
    const ipOrApi = dto.configuration ?? dto.ipOrApi;
    if (ipOrApi !== undefined && ipOrApi !== null && ipOrApi !== '') {
      const exists = await Hardware.query().where('ipOrApi', ipOrApi).first();
      if (exists) {
        AppException.conflict({
          message: `Hardware with ipOrApi ${ipOrApi} already exists.`,
        });
      }
    }

    const assignedUser =
      dto.assignedUser === undefined || dto.assignedUser === null || (dto.assignedUser as any) === ''
        ? null
        : Number(dto.assignedUser);

    const id = await Hardware.transaction(async (trx) => {
      const inserted: any = await Hardware.query(trx).insert({
        sku: dto.partName ?? dto.sku ?? null,
        description: dto.description ?? null,
        ipOrApi: ipOrApi ?? null,
        type: dto.type ?? null,
        ...(dto.status ? { status: dto.status } : {}),
        user: authId ?? null,
        assignedTo: dto.assignedTo,
        asignee: Number(dto.asignee),
        assignedUser,
        ...(dto.uniqueId ? { uniqueId: dto.uniqueId } : {}),
      } as any);

      await HardwareAssignLogs.query(trx).insert({
        hardware: inserted.id,
        assignee: Number(dto.asignee),
        user: authId ?? null,
        assignTo: dto.assignedTo,
        description: dto.description ?? '',
        assignedUser,
      } as any);

      return inserted.id;
    });

    return await this.deviceIssuanceRow(id);
  }

  // Update hardware (only the fields sent) + always write a hardware_assign_logs
  // row, like legacy PUT /api/hardware/:id
  async deviceIssuanceUpdate(id: number, dto: UpdateHardwareDto, authId?: number) {
    if (!dto || Object.keys(dto).length === 0) {
      AppException.badRequest({ message: 'No fields provided to update.' });
    }

    const existing: any = await Hardware.query().findById(id);
    if (!existing) {
      AppException.notFound({ message: `Hardware with ID ${id} not found.` });
    }

    const has = (k: string) => Object.prototype.hasOwnProperty.call(dto, k);
    const toIntOrNull = (v: any) =>
      v === undefined || v === null || v === '' ? null : Number(v);

    const patch: any = {};
    if (has('partName') || has('sku')) patch.sku = dto.partName ?? dto.sku ?? null;
    if (has('description')) patch.description = dto.description ?? null;
    if (has('configuration') || has('ipOrApi')) patch.ipOrApi = dto.configuration ?? dto.ipOrApi ?? null;
    if (has('type')) patch.type = dto.type ?? null;
    if (has('status') && dto.status) patch.status = dto.status;
    if (has('assignedTo') && dto.assignedTo) patch.assignedTo = dto.assignedTo;
    if (has('asignee') && toIntOrNull(dto.asignee) !== null) patch.asignee = Number(dto.asignee);
    if (has('assignedUser')) patch.assignedUser = toIntOrNull(dto.assignedUser);
    if (has('uniqueId')) patch.uniqueId = dto.uniqueId || null;

    await Hardware.transaction(async (trx) => {
      await HardwareAssignLogs.query(trx).insert({
        hardware: id,
        assignee: patch.asignee ?? existing.asignee,
        user: authId ?? existing.user ?? null,
        assignTo: patch.assignedTo ?? existing.assignedTo,
        description: (has('description') ? dto.description : existing.description) ?? '',
        assignedUser: has('assignedUser') ? patch.assignedUser : existing.assignedUser ?? null,
      } as any);

      if (Object.keys(patch).length > 0) {
        await Hardware.query(trx).patch(patch).where('id', id);
      }
    });

    return await this.deviceIssuanceRow(id);
  }

  private hasAssignmentChange(dto: UpdateHardwareDto): boolean {
    return (
      LodashHelper.get(dto, 'asignee') !== undefined ||
      LodashHelper.get(dto, 'assignedTo') !== undefined ||
      LodashHelper.get(dto, 'assignedUser') !== undefined
    );
  }
}
