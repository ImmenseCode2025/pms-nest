import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PosDevice } from 'src/core/orm/entities/pos-device.entity';
import { CreatePosDeviceDto } from './dto/create-pos-device.dto';
import { PosDevicePaginatedDto } from './dto/pos-device-paginated.dto';
import { UpdatePosDeviceDto } from './dto/update-pos-device.dto';

@Injectable()
export class PosDevicesService {
  async create(dto: CreatePosDeviceDto) {
    return await PosDevice.query().insertAndFetch({
      serial_number: dto.serial_number,
      bank: dto.bank,
      site_id: dto.site_id,
    });
  }

  async paginated(data: any = {}) {
    const dto: PosDevicePaginatedDto = data.dto || {};
    const query = PosDevice.query();

    if (dto.site_id) {
      query.where('site_id', dto.site_id);
    }
    if (dto.bank) {
      query.where('bank', dto.bank);
    }
    if (dto?.search) {
      query.where((builder) => {
        builder
          .where('serial_number', 'like', `%${dto.search}%`)
          .orWhere('bank', 'like', `%${dto.search}%`);
      });
    }

    query.withGraphFetched('site');
    query.orderBy('id', 'desc');

    return await PosDevice.pagination(query, data);
  }

  async findOne(id: number) {
    const item = await PosDevice.query().findById(id).withGraphFetched('site');
    if (!item) {
      throw new HttpException('POS device not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  async update(dto: UpdatePosDeviceDto) {
    const { id, ...payload } = dto;
    await this.findOne(id);
    return await PosDevice.query().patchAndFetchById(id, payload);
  }

  async delete(id: number) {
    await this.findOne(id);
    await PosDevice.query().deleteById(id);
    return true;
  }
}
