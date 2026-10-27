import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { Operator } from 'src/core/orm/entities/operator.entity';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { OperatorPaginatedDto } from './dto/operator-paginated.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Injectable()
export class OperatorsService {
  // 1. CREATE
  async getPasswords() {
    const usedOperators = await Operator.query()
      .select('password')
      .whereNotNull('password');
    const usedSet = new Set(usedOperators.map((o) => String(o.password)));

    const candidates: string[] = [];
    for (let i = 1000; i <= 9999; i++) {
      const pin = String(i);
      if (!usedSet.has(pin)) {
        candidates.push(pin);
      }
    }

    if (!candidates.length) {
      AppException.badRequest({ message: 'No available passwords found.' });
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
  async create(dto: CreateOperatorDto) {
    const item = await Operator.query().insertAndFetch({
      site_id: dto.site_id,
      supervisor_id: dto.supervisor_id,
      username: dto.username,
      mobile: dto.mobile,
      email: dto.email,
      cnic: dto.cnic,
      password: dto.password,
      profile_image: dto.profile_image,
    });
    return item;
  }

  // 2. PAGINATED
  async paginated(data: any = {}) {
    const dto: OperatorPaginatedDto = data.dto || {};
    const query = Operator.query();

    if (dto.site_id !== undefined) {
      query.where('site_id', dto.site_id);
    }

    if (dto.supervisor_id !== undefined) {
      query.where('supervisor_id', dto.supervisor_id);
    }

    if (dto.status) {
      query.where('status', dto.status);
    }

    if (dto.search_text) {
      const search = `%${dto.search_text}%`;
      query.where((builder) => {
        builder
          .where('username', 'like', search)
          .orWhere('mobile', 'like', search)
          .orWhere('email', 'like', search)
          .orWhere('cnic', 'like', search);
      });
    }

    query.withGraphFetched('[site, supervisor]');
    query.orderBy('id', 'desc');

    return await Operator.pagination(query, data);
  }

  // 3. READ BY ID
  async findOne(id: number) {
    const item = await Operator.query()
      .findById(id)
      .withGraphFetched('[site, supervisor]');

    if (!item) {
      AppException.notFound({ message: 'Operator not found' });
    }
    return item;
  }

  // 4. UPDATE
  async update(dto: UpdateOperatorDto, authId?: number) {
    await this.findOne(dto.id);
    const updated = await Operator.query().patchAndFetchById(dto.id, {
      site_id: dto.site_id,
      supervisor_id: dto.supervisor_id,
      username: dto.username,
      mobile: dto.mobile,
      email: dto.email,
      cnic: dto.cnic,
      password: dto.password,
      profile_image: dto.profile_image,
      status: dto.status,
    });
    return updated;
  }

  // 5. DELETE
  async delete(id: number) {
    await this.findOne(id);
    await Operator.query().deleteById(id);
    return true;
  }
}
