import { Injectable } from '@nestjs/common';
import { FOC } from 'src/core/orm/entities';
import { FocPaginatedDto } from './dto/foc-paginated.dto';

const FOC_COMPANY_ID = 7;

@Injectable()
export class FocService {
  async paginated(data: any = {}) {
    const dto: FocPaginatedDto = data.dto || {};
    const query = FOC.query().where('foc_card.company', FOC_COMPANY_ID);

    if (dto.site_id) {
      query.where('foc_card.site', dto.site_id);
    }

    if (dto.search_text) {
      const search = `%${dto.search_text.trim()}%`;
      query.where((builder) => {
        builder
          .where('foc_card.employeeName', 'like', search)
          .orWhere('foc_card.employeeId', 'like', search);
      });
    }

    query.withGraphFetched('[focParkingSites, focCompanies, focDesignations]');
    query.modifyGraph('focParkingSites', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focCompanies', (builder) => builder.select('id', 'name'));
    query.modifyGraph('focDesignations', (builder) => builder.select('id', 'name'));
    query.orderBy('foc_card.id', 'desc');

    return await FOC.pagination(query, data);
  }
}
