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

    const raw = dbResult?.[0] || [];
    const rows = Array.isArray(raw[0]) ? raw[0] : raw;

    const total =
      dbResult?.[1]?.[0]?.total ??
      rows?.[0]?.total_count ??
      rows?.[0]?.total ??
      rows.length;

    const storedResult = {
      results: rows,
      total,
    };

    return ParkingToken.paginationResponse(storedResult, data);
  }
}
