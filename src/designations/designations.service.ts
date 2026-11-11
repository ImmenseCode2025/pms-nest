import { Injectable } from '@nestjs/common';
import { Designation } from 'src/core/orm/entities/designation.entity';

@Injectable()
export class DesignationsService {
  async dropdown() {
    return await Designation.query()
      .select('id', 'name')
      .orderBy('name', 'asc');
  }
}
