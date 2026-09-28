import { Injectable } from '@nestjs/common';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { SearchParkingSitesDto } from './dto/search-parking-sites.dto';

@Injectable()
export class ParkingSitesService {
  async paginated(data: any = {}) {
    const dto: SearchParkingSitesDto = data.dto || {};
    const query = ParkingSite.query();
    query.where('company', 7);
    query.withGraphFetched('[site_address]')
     if (dto.search) {
      const searchText = `%${dto.search}%`;
      query.where((builder) => {
        builder
          .where('name', 'like', searchText)
          .orWhere('sgi', 'like', searchText);
      });
    }

    query.orderBy('id', 'desc');
    const result = await ParkingSite.pagination(query, data);
    return result;
  }

  
}
