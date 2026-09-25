import { Module } from '@nestjs/common';
import { CorporateCardsController } from './corporate-cards.controller';
import { CorporateCardsService } from './corporate-cards.service';

@Module({
  controllers: [CorporateCardsController],
  providers: [CorporateCardsService],
  exports: [CorporateCardsService],
})
export class CorporateCardsModule {}
