import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { VehicleType } from 'src/core/orm/entities/vehicle-type.entity';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { VehicleTypePaginatedDto } from './dto/vehicle-type-paginated.dto';

@Injectable()
export class VehicleTypesService {
  // 1. CREATE
  async create(dto: CreateVehicleTypeDto) {
    const item = await VehicleType.query().insertAndFetch({
      name: dto.name,
    });
    return item;
  }

  // 2. PAGINATED LISTING
  async paginated(data: any = {}) {
    const dto: VehicleTypePaginatedDto = data.dto || {};
    const query = VehicleType.query();
    query.orderBy('id', 'desc');
    return await VehicleType.pagination(query, data);
  }

  // 3. READ BY ID
  async findOne(id: number) {
    const item = await VehicleType.query().findById(id);

    if (!item) {
      AppException.notFound({ message: 'Vehicle type not found' });
    }
    return item;
  }

  // 4. UPDATE
  async update(dto: UpdateVehicleTypeDto) {
    await this.findOne(dto.id);

    const updated = await VehicleType.query().patchAndFetchById(dto.id, {
      name: dto.name,
      updatedAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
    });
    return updated;
  }

  // 5. DELETE
  async delete(id: number) {
    await this.findOne(id);
    await VehicleType.query().deleteById(id);
    return true;
  }

  // 6. DROPDOWN (Convenience for form selectors)
  async dropdown() {
    return await VehicleType.query()
      .select('id', 'name')
      .orderBy('name', 'asc');
  }
}
