import { Injectable } from '@nestjs/common';
import { CorporateCards } from 'src/core/orm/entities/corporate-cards.entity';
import { CorporateCardsPaginatedDto } from './dto/corporate-cards-paginated.dto';

@Injectable()
export class CorporateCardsService {
  
  async list(dto: CorporateCardsPaginatedDto) {
    const query = CorporateCards.query();
    query.orderBy('id', 'desc');
    return await CorporateCards.findAllCustom(query);
  }
}
