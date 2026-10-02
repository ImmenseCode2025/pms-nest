import {
  Injectable
} from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { AppQrCode } from 'src/core/orm/entities/app-qr-code.entity';
import { CashQrCode } from 'src/core/orm/entities/cash-qr-code.entity';
import { CompanyCards } from 'src/core/orm/entities/company-cards.entity';
import { CompanyQrCode } from 'src/core/orm/entities/company-qr-code.entity';
import { Discount } from 'src/core/orm/entities/discount.entity';
import { FocQrCode } from 'src/core/orm/entities/foc-qr-code.entity';
import { FOC } from 'src/core/orm/entities/foc.entity';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { InstanceEntranceExit } from 'src/core/orm/entities/instance-entrance-exit.entity';
import { ParkingBlockFloor } from 'src/core/orm/entities/parking-block-floor.entity';
import { ParkingBlock } from 'src/core/orm/entities/parking-block.entity';
import { ParkingCard } from 'src/core/orm/entities/parking-card.entity';
import { ParkingGate } from 'src/core/orm/entities/parking-gate.entity';
import { ParkingLot } from 'src/core/orm/entities/parking-lot.entity';
import { ParkingPriceLogs } from 'src/core/orm/entities/parking-price-logs.entity';
import { ParkingPrice } from 'src/core/orm/entities/parking-price.entity';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { ParkingToken } from 'src/core/orm/entities/parking-token.entity';
import { PosQrCode } from 'src/core/orm/entities/pos-qr-code.entity';
import { SearchParkingSitesDto } from './dto/search-parking-sites.dto';

@Injectable()
export class ParkingSitesService {
  async paginated(data: any = {}) {
    const dto: SearchParkingSitesDto = data.dto || {};
    const query = ParkingSite.query();
    query.where('company', 7);
    query.withGraphFetched('[site_address]');

    // Reusable function to attach totalEntries (Tokens + Receipts combination)
    ParkingSite.withSiteEntryCounts(query);

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

  async dropdown() {
    const query = ParkingSite.query();
    const company = 7;
    query.where('company', company);
    query.orderBy('name', 'asc');

    const sites = await ParkingSite.findAllCustom(query);
    return sites
  }

  async delete(id: number) {
    // 1. Check if Parking Site exists
    const site = await ParkingSite.query().findById(id);
    if (!site) {
      AppException.notFound({ message: `Parking site #${id} not found` });
    }

    // 2. Check if any tokens exist for this site
    const tokenCount = await ParkingToken.query()
      .where('site', id)
      .resultSize();

    if (tokenCount > 0) {
      AppException.badRequest({
        message: `Cannot delete parking site: ${tokenCount} parking token(s) are already generated for this site.`,
      });
    }

    // Check if handheld receipts exist on hardware assigned to this site
    const hardwareList = await Hardware.query()
      .where('asignee', id)
      .select('ipOrApi');
    const deviceIps = hardwareList
      .map((h: any) => h.ipOrApi)
      .filter((ip: string) => Boolean(ip));

    if (deviceIps.length > 0) {
      const receiptCount = await ParkingReceipt.query()
        .whereIn('deviceId', deviceIps)
        .resultSize();

      if (receiptCount > 0) {
        AppException.badRequest({
          message: `Cannot delete parking site: ${receiptCount} parking receipt(s) are already generated for this site.`,
        });
      }
    }

    // 3. Perform safe cascade deletion inside an atomic transaction
    await ParkingSite.transaction(async (trx) => {
      // Delete Parking Prices & Price Logs
      await ParkingPrice.query().transacting(trx).where('siteId', id).delete();
      await ParkingPriceLogs.query()
        .transacting(trx)
        .where('siteId', id)
        .delete();

      // Delete Discounts
      await Discount.query().transacting(trx).where('site', id).delete();

      // Delete QR Codes & Cards linked to site
      await AppQrCode.query().transacting(trx).where('site', id).delete();
      await CompanyQrCode.query().transacting(trx).where('site', id).delete();
      await FocQrCode.query().transacting(trx).where('site', id).delete();
      await CashQrCode.query().transacting(trx).where('site', id).delete();
      await PosQrCode.query().transacting(trx).where('site', id).delete();
      await CompanyCards.query().transacting(trx).where('site', id).delete();
      await FOC.query().transacting(trx).where('site', id).delete();

      // Delete Blocks, Floors, Lots, Gates & Instances
      const blocks = await ParkingBlock.query()
        .transacting(trx)
        .where('site', id)
        .select('id');
      const blockIds = blocks.map((b: any) => b.id);

      if (blockIds.length > 0) {
        // Floors & Lots
        const floors = await ParkingBlockFloor.query()
          .transacting(trx)
          .whereIn('block', blockIds)
          .select('id');
        const floorIds = floors.map((f: any) => f.id);

        if (floorIds.length > 0) {
          await ParkingLot.query()
            .transacting(trx)
            .whereIn('floor', floorIds)
            .delete();

          await ParkingBlockFloor.query()
            .transacting(trx)
            .whereIn('id', floorIds)
            .delete();
        }

        // Gates & Instances
        const gates = await ParkingGate.query()
          .transacting(trx)
          .whereIn('block', blockIds)
          .select('id');
        const gateIds = gates.map((g: any) => g.id);

        if (gateIds.length > 0) {
          await InstanceEntranceExit.query()
            .transacting(trx)
            .whereIn('gate', gateIds)
            .delete();

          await ParkingGate.query()
            .transacting(trx)
            .whereIn('id', gateIds)
            .delete();
        }

        // Parking Cards on block
        await ParkingCard.query()
          .transacting(trx)
          .whereIn('parkingBlock', blockIds)
          .delete();

        // Delete Blocks
        await ParkingBlock.query()
          .transacting(trx)
          .whereIn('id', blockIds)
          .delete();
      }

      // Unassign hardware assigned to this site
      await Hardware.query()
        .transacting(trx)
        .where('asignee', id)
        .patch({ asignee: null });

      // Delete the Parking Site
      await ParkingSite.query().transacting(trx).deleteById(id);
    });

    return { id, deleted: true };
  }
}
