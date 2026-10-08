import { Injectable } from '@nestjs/common';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { HardwareFilterDto } from './dto/hardware-filter.dto';

@Injectable()
export class HardwareService {
  async getHandheldList(dto?: HardwareFilterDto) {
    const query = Hardware.query();
    query.where('type', 'handheld');
    query.where('siteId', dto.siteId);
    query.withGraphFetched('Hardware_site');
    query.orderBy('id', 'desc');
    return await Hardware.findAllCustom(query);
  }
}
