import { Injectable } from '@nestjs/common';
import { ParkingToken } from 'src/core/orm/entities';
import { ParkingTicketsPaginatedDto } from './dto/parking-tickets-paginated.dto';

@Injectable()
export class ParkingTicketsService {
  async paginated(data: any = {}) {
    const dto: ParkingTicketsPaginatedDto = data.dto || {};
    const query = ParkingToken.query()
    query.withGraphFetched('[vehicle_type,parking_site]');
    query.orderBy('id','desc')
    const result = await ParkingToken.pagination(query, data);
    return result;
  }

}
