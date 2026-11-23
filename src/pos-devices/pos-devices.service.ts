import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PosDeviceLogs } from 'src/core/orm/entities/pos-device-logs.entity';
import { PosDevice } from 'src/core/orm/entities/pos-device.entity';
import { CreatePosDeviceDto } from './dto/create-pos-device.dto';
import { PosDevicePaginatedDto } from './dto/pos-device-paginated.dto';
import { UpdatePosDeviceDto } from './dto/update-pos-device.dto';
import { PosDeviceLogsHelper } from './helpers/pos-device-logs.helper';

@Injectable()
export class PosDevicesService {
  constructor(private readonly posDeviceLogsHelper: PosDeviceLogsHelper) {}

  async create(dto: CreatePosDeviceDto, authId: number) {
    const device = await PosDevice.query().insertAndFetch({
      serial_number: dto.serial_number,
      bank: dto.bank,
      site_id: dto.site_id,
    });
    await this.posDeviceLogsHelper.logCreated(device, authId);
    return device;
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

  async update(dto: UpdatePosDeviceDto, authId: number) {
    const { id, ...payload } = dto;
    const before = await this.findOne(id);
    const after = await PosDevice.query().patchAndFetchById(id, payload);
    await this.posDeviceLogsHelper.logUpdated(before, after, authId);
    return after;
  }

  async delete(id: number, authId: number) {
    const device = await this.findOne(id);
    await PosDevice.query().deleteById(id);
    await this.posDeviceLogsHelper.logDeleted(device, authId);
    return true;
  }

  async logs(posDeviceId: number) {
    return await PosDeviceLogs.query()
      .where('pos_device_id', posDeviceId)
      .withGraphFetched('user')
      .orderBy('id', 'desc');
  }
}
