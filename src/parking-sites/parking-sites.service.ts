import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { ExternalApiService } from 'src/core/external-api/external-api.service';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { Address } from 'src/core/orm/entities/address.entity';
import { Hardware } from 'src/core/orm/entities/hardware.entity';
import { ParkingBlockFloor } from 'src/core/orm/entities/parking-block-floor.entity';
import { ParkingBlock } from 'src/core/orm/entities/parking-block.entity';
import { ParkingLot } from 'src/core/orm/entities/parking-lot.entity';
import { ParkingPrice } from 'src/core/orm/entities/parking-price.entity';
import { ParkingReceipt } from 'src/core/orm/entities/parking-receipt.entity';
import { ParkingSite } from 'src/core/orm/entities/parking-site.entity';
import { ParkingToken } from 'src/core/orm/entities/parking-token.entity';
import { VehicleType } from 'src/core/orm/entities/vehicle-type.entity';
import { GetHandheldInfoDto } from './dto/get-handheld-info.dto';
import { RegisterParkingSiteDto } from './dto/register-parking-site.dto';
import { SearchParkingSitesDto } from './dto/search-parking-sites.dto';
import { UpdateParkingPriceDto } from './dto/update-parking-price.dto';

@Injectable()
export class ParkingSitesService {
  constructor(private readonly externalApiService: ExternalApiService) {}

  async paginated(data: any = {}) {
    const dto: SearchParkingSitesDto = data.dto || {};
    const query = ParkingSite.query();
    query.where('company', 7);

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

  async siteDropdown() {
    const query = ParkingSite.query();
    const company = 7;
    query.select('id', 'name');
    query.where('company', company);
    query.orderBy('name', 'asc');

    const sites = await ParkingSite.findAllCustom(query);
    return sites;
  }

  async dropdown() {
    const query = ParkingSite.query();
    const company = 7;
    query.where('company', company);
    query.orderBy('name', 'asc');

    const sites = await ParkingSite.findAllCustom(query);
    return sites;
  }

  async detail(id: number) {
    const site = await ParkingSite.query()
      .findById(id)
      .withGraphFetched('[siteParkingPrices.price_vehicle_type, siteParkingCompany]')
      .modifyGraph('siteParkingCompany', (builder) => builder.select('id', 'name'));

    if (!site) {
      AppException.notFound({ message: `Parking site #${id} not found` });
    }

    return site;
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

    // 3. Delete only the Parking Site record
    await ParkingSite.query().deleteById(id);

    return { id, deleted: true };
  }

  async register(dto: RegisterParkingSiteDto, authId: number) {
    // const { site, block } = dto;

    // const company = await Company.query().findById(site.company);
    // if (!company) {
    //   AppException.notFound({ message: `Company #${site.company} not found` });
    // }

    // Reverse geocoding is an external HTTP call, so resolve addresses before the transaction
    // const siteAddressId = await this.resolveAddressId(
    //   site.latitude,
    //   site.longitude,
    // );
    // const blockAddressIds = [];
    // for (const row of block) {
    //   blockAddressIds.push(
    //     await this.resolveAddressId(row.latitude, row.longitude),
    //   );
    // }

    const newSite = await ParkingSite.query().insertAndFetch({
      name: dto.name,
      status: 'active',
      sgi: '-',
      area: dto.area,
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      company: 7,
      user: authId,
      createdAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
      updatedAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
    });
    const siteSgi = 'KMC' + 'PS' + newSite.id;
    await ParkingSite.query().patch({ sgi: siteSgi }).where('id', newSite.id);

    for (const element of dto.pricing) {
      await ParkingPrice.query().insertAndFetch({
        vehicleType: element.vehicle_type_id,
        amount: element.amount,
        siteId: newSite.id,
        createdAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
        updatedAt: GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss'),
        user: authId,
      });
    }

    return true;

    // const siteId = await ParkingSite.transaction(async (trx) => {
    //   // SGI uses the auto-increment id, so numbers of deleted sites are never reused

    //   for (const [i, row] of block.entries()) {
    //     await this.registerBlock(trx, row, {
    //       sgi: siteSgi + 'B' + (i + 1),
    //       address: blockAddressIds[i],
    //       site: newSite.id,
    //       user: authId,
    //     });
    //   }

    //   return newSite.id;
    // });

    // return ParkingSite.query()
    //   .findById(siteId)
    //   .withGraphFetched(
    //     '[site_address, parkingSiteParkingBlocks.parkingBlocksFloor]',
    //   );
  }

  private async registerBlock(trx, row, { sgi, address, site, user }) {
    const newBlock = await ParkingBlock.query(trx).insertAndFetch({
      name: row.name,
      sgi,
      address,
      status: 'active',
      user,
      site,
    });

    for (const [j, floor] of (row.floor ?? []).entries()) {
      const floorSgi = sgi + 'F' + (j + 1);
      const newFloor = await ParkingBlockFloor.query(trx).insertAndFetch({
        name: floor.name,
        sgi: floorSgi,
        status: 'active',
        user,
        block: newBlock.id,
      });

      const lots = [];
      for (let k = 1; k <= Number(floor.noOfLots); k++) {
        lots.push({
          name: 'P' + k,
          sgi: floorSgi + 'P' + k,
          status: 'active',
          user,
          floor: newFloor.id,
          availability: 'unoccupied',
        });
      }

      if (lots.length > 0) {
        await ParkingLot.knexQuery().transacting(trx).insert(lots);
      }
    }
  }

  private async resolveAddressId(
    latitude: number,
    longitude: number,
  ): Promise<number> {
    const existing: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();

    if (existing) return existing.id;

    const geoData = await this.externalApiService.reverseGeocode(
      latitude,
      longitude,
    );
    const addr = geoData?.address ?? {};

    const addressPayload = {
      name: geoData?.display_name ?? geoData?.name ?? null,
      city:
        addr.city ??
        addr.town ??
        addr.village ??
        addr.municipality ??
        addr.road ??
        null,
      state: addr.state ?? addr.state_district ?? addr.city_district ?? null,
      country: addr.country ?? null,
      zipCode: addr.postcode ?? null,
      latitude,
      longitude,
    };

    const doubleCheck: any = await Address.query()
      .where('latitude', latitude)
      .where('longitude', longitude)
      .first();
    if (doubleCheck) return doubleCheck.id;

    const newAddress: any =
      await Address.query().insertAndFetch(addressPayload);
    return newAddress.id;
  }

  async getHandheldInfo(dto: GetHandheldInfoDto) {
    const site = await ParkingSite.query()
      .select('id', 'name')
      .where('id', dto.siteId)
      .first();

    if (!site) {
      throw new HttpException('Site not found', HttpStatus.NOT_FOUND);
    }

    const siteParkingPrices = await ParkingPrice.query()
      .select(
        ParkingSite.raw(
          'COALESCE(vehicle_type.name, CAST(parking_price.vehicleType AS CHAR)) as vehicleType',
        ),
        'parking_price.amount as amount',
      )
      .leftJoin('vehicle_type', 'parking_price.vehicleType', 'vehicle_type.id')
      .where('parking_price.siteId', dto.siteId);

    return {
      id: site.id,
      name: site.name,
      siteParkingPrices,
    };
  }

  // Set the prices of ALL vehicle types for a site in one go.
  // Body: { siteId, prices: [{ vehicleType, amount }] }. Every vehicle type in
  // vehicle_type must have an amount; each row is upserted in one transaction.
  // (parking_price_logs has been dropped, so no history row is written.)
  async updatePrice(dto: UpdateParkingPriceDto, authId: number) {
    const siteId = Number(dto.siteId);

    const site = await ParkingSite.query().findById(siteId);
    if (!site) {
      AppException.notFound({ message: `Parking site #${siteId} not found` });
    }

    // @Type(() => Number) turns "" into 0, so reject blank amounts on the raw body.
    const blank = (dto.prices || []).filter(
      (p: any) => p?.amount === '' || p?.amount === null || p?.amount === undefined,
    );
    if (blank.length) {
      AppException.badRequest({ message: 'Amount is required for every vehicle type' });
    }

    const prices = (dto.prices || []).map((p) => ({
      vehicleType: Number(p.vehicleType),
      amount: Number(p.amount),
    }));

    const ids = prices.map((p) => p.vehicleType);
    if (new Set(ids).size !== ids.length) {
      AppException.badRequest({ message: 'Duplicate vehicle type in prices' });
    }

    const vehicleTypes: any[] = await VehicleType.query().select('id', 'name');
    const known = new Set(vehicleTypes.map((v) => Number(v.id)));
    const unknown = ids.filter((id) => !known.has(id));
    if (unknown.length) {
      AppException.badRequest({ message: `Unknown vehicle type: ${unknown.join(', ')}` });
    }
    const missing = vehicleTypes.filter((v) => !ids.includes(Number(v.id)));
    if (missing.length) {
      AppException.badRequest({
        message: `Amount is required for: ${missing.map((v) => v.name).join(', ')}`,
      });
    }

    const now = GlobalHelper.getDateTime('YYYY-MM-DD HH:mm:ss');
    await ParkingPrice.transaction(async (trx) => {
      for (const { vehicleType, amount } of prices) {
        const existing: any = await ParkingPrice.query(trx)
          .where('siteId', siteId)
          .where('vehicleType', vehicleType)
          .first();

        if (existing) {
          await ParkingPrice.query(trx)
            .patch({ amount, user: authId, updateDateTime: now, updatedAt: now } as any)
            .where('siteId', siteId)
            .where('vehicleType', vehicleType);
        } else {
          await ParkingPrice.query(trx).insert({
            vehicleType,
            amount,
            siteId,
            user: authId,
            createdAt: now,
            updatedAt: now,
          } as any);
        }
      }
    });

    return {
      response: 'success',
      message: 'Parking Site Prices Updated Successfully!',
    };
  }
}
