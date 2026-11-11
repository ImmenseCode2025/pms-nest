import { Module } from '@nestjs/common';
import { CorporatesModule } from 'src/corporates/corporates.module';
import { CorporateFinanceController } from './corporate-finance.controller';
import { CorporateFinanceService } from './corporate-finance.service';

// MailerService comes from the global MailerCoreModule registered by AuthModule.
// CorporatesService (exported by CorporatesModule) is used read-only for its existing invoice PDF generator.
@Module({
  imports: [CorporatesModule],
  controllers: [CorporateFinanceController],
  providers: [CorporateFinanceService],
  exports: [CorporateFinanceService],
})
export class CorporateFinanceModule {}
