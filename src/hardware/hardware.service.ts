import { Injectable } from '@nestjs/common';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { HardwareFilterDto } from './dto/hardware-filter.dto';
import { HardwarePaginatedDto } from './dto/hardware-paginated.dto';

@Injectable()
export class HardwareService {
  async getHandheldList(dto?: HardwareFilterDto) {
    const query = Hardware.query();
    query.where('type', 'handheld');
    query.where('asignee', dto?.siteId)
    query.withGraphFetched('Hardware_site');
    query.orderBy('id', 'desc');
    return await Hardware.findAllCustom(query);
  }

  async paginated(data: any = {}) {
    const dto: HardwarePaginatedDto = data.dto || {};
    const query = Hardware.query();

    // Handheld only
    query.where('type', 'handheld');

    if (dto.siteId !== undefined) {
      query.where((builder) => {
        builder.where('asignee', dto.siteId).orWhere('siteId', dto.siteId);
      });
    }

    if (dto.status) {
      query.where('status', dto.status);
    }

    if (dto.search) {
      query.where((builder) => {
        builder
          .where('partName', 'like', `%${dto.search}%`)
          .orWhere('uniqueId', 'like', `%${dto.search}%`)
          .orWhere('description', 'like', `%${dto.search}%`);
      });
    }

    query.withGraphFetched('Hardware_site');
    query.orderBy('id', 'desc');

    return await Hardware.pagination(query, data);
  }
}
