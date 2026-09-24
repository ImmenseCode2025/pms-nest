import { Injectable } from '@nestjs/common';
import { ParkingToken } from 'src/core/orm/entities';
import { ParkingTicketsPaginatedDto } from './dto/parking-tickets-paginated.dto';

@Injectable()
export class ParkingTicketsService {
  async paginated(data: any = {}) {
    const dto: ParkingTicketsPaginatedDto = data.dto || {};
    const { currentPage, perPage } = ParkingToken.getPaginationParams(data);

    const search = dto.search?.trim() || null;
    const siteId = dto.site ? Number(dto.site) : null;
    const vehicleType = dto.vehicleType ? Number(dto.vehicleType) : null;
    const deviceType = dto.deviceType?.trim() || null; // 'system' | 'handheld' | null
    const startDate = dto.startDate?.trim() || null;
    const endDate = dto.endDate?.trim() || null;

    const dbResult: any = await ParkingToken.knex().raw(
      `CALL sp_get_parking_tickets(?, ?, ?, ?, ?, ?, ?, ?)`,
      [currentPage, perPage, search, siteId, vehicleType, deviceType, startDate, endDate],
    );

    return ParkingToken.paginationResponse(dbResult, data);
  }
}
