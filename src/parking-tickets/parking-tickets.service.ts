import { Injectable } from '@nestjs/common';
import { ParkingToken } from 'src/core/orm/entities';
import { ParkingTicketsPaginatedDto } from './dto/parking-tickets-paginated.dto';

@Injectable()
export class ParkingTicketsService {
  async paginated(data: any = {}) {
    const dto: ParkingTicketsPaginatedDto = data.dto || {};
    const { currentPage, perPage } = ParkingToken.getPaginationParams(data);

    const dbResult: any = await ParkingToken.knex().raw(
      `CALL sp_get_parking_tickets(?, ?, ?)`,
      [currentPage, perPage, dto.search?.trim() || null],
    );

    return ParkingToken.paginationResponse(dbResult, data);
  }
}
