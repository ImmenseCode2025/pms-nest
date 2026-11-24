import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { AppException } from 'src/core/exception/app-exception';
import { CorporateCards } from 'src/core/orm/entities/corporate-cards.entity';
import { CorporateQrCode } from 'src/core/orm/entities/corporate-qr-code.entity';
import {
  insertPortalNotification,
  nowWallClock,
  softDeleteNotificationsByRequestId,
} from 'src/corporates/corporate-notification.helper';
import { CorporateCardsPaginatedDto } from './dto/corporate-cards-paginated.dto';
import { CorporateCardBulkDecisionDto } from './dto/corporate-card-bulk-decision.dto';
import {
  CorporateCardQrCodesQueryDto,
  CorporateCardRequestsQueryDto,
} from './dto/corporate-card-requests-query.dto';

const toPositiveInt = (v: any, def: number) => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n > 0 ? n : def;
};

const splitList = (v: any): string[] =>
  v
    ? String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

/** Raw `corporate_cards` row -> legacy Sequelize JSON keys (corporateId, requestStatus). */
const toLegacyCard = (r: any) => {
  if (!r) return r;
  const { corporate, status, ...rest } = r;
  return { ...rest, corporateId: corporate ?? null, requestStatus: status };
};

const generateOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

@Injectable()
export class CorporateCardsService {
  async list(dto: CorporateCardsPaginatedDto) {
    const query = CorporateCards.query();
    query.select('id', 'status', 'vehicleNumber');
    query.orderBy('id', 'desc');
    return await CorporateCards.findAllCustom(query);
  }

  private async vehicleTypeMap(ids: any[]): Promise<Record<number, string>> {
    const unique = [...new Set(ids.filter(Boolean).map(Number))];
    if (!unique.length) return {};
    const rows: any[] = await CorporateCards.knex()('vehicle_type')
      .whereIn('id', unique)
      .select('id', 'name');
    return rows.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {});
  }

  /** Legacy search on corporate_cards: vehicleNumber / requestId / status / corporate name. */
  private applyCardSearch(qb: any, search: string) {
    if (!search) return;
    const like = `%${search}%`;
    const knex = CorporateCards.knex();
    qb.where((b: any) => {
      b.where('corporate_cards.vehicleNumber', 'like', like)
        .orWhere('corporate_cards.requestId', 'like', like)
        .orWhere('corporate_cards.status', 'like', like)
        .orWhereIn(
          'corporate_cards.corporate',
          knex('corporates').select('id').where('name', 'like', like),
        );
    });
  }

  // GET api/corporate-cards  (legacy corporateCardsService.findAll)
  async findAllRequests(dto: CorporateCardRequestsQueryDto) {
    const page = toPositiveInt(dto?.page, 1);
    const pageSize = toPositiveInt(dto?.pageSize, 10);
    const offset = (page - 1) * pageSize;
    const search = (dto?.search || '').trim();
    const groupByRequest = dto?.group === 'true' || dto?.group === '1';
    const knex = CorporateCards.knex();

    if (!groupByRequest) {
      const countQ = knex('corporate_cards');
      this.applyCardSearch(countQ, search);
      const [{ total }] = await countQ.count({ total: '*' });

      const query = CorporateCards.query()
        .withGraphFetched('corporateCardsCorporate(selectCorporate)')
        .modifiers({
          selectCorporate: (b: any) => b.select('id', 'name'),
        })
        .orderBy('corporate_cards.createdAt', 'desc')
        .limit(pageSize)
        .offset(offset);
      this.applyCardSearch(query, search);
      const rows: any[] = await query;
      const typeMap = await this.vehicleTypeMap(rows.map((r) => r.vehicleType));

      const data = rows.map((r) => {
        const { corporateCardsCorporate, ...card } = r;
        return {
          ...toLegacyCard(card),
          corporateCardsCorporate: corporateCardsCorporate
            ? {
                corporateId: corporateCardsCorporate.id,
                name: corporateCardsCorporate.name,
              }
            : null,
          vehicleTypeName: r.vehicleType ? typeMap[r.vehicleType] || null : null,
        };
      });
      const count = Number(total) || 0;
      return { count, data, page, pageSize, totalPages: Math.ceil(count / pageSize) };
    }

    // Grouped by requestId
    const countQ = knex('corporate_cards');
    this.applyCardSearch(countQ, search);
    const [{ total }] = await countQ.countDistinct({ total: 'requestId' });

    // Dates returned as stored wall-clock without "Z" (parsed as local time by the browser).
    const dt = (expr: string, alias: string) =>
      knex.raw(`DATE_FORMAT(${expr}, '%Y-%m-%dT%H:%i:%s') as ${alias}`);

    const groupsQ = knex('corporate_cards')
      .select(
        'corporate_cards.requestId as requestId',
        knex.raw('MAX(corporate_cards.corporate) as corporateId'),
        knex.raw('COUNT(corporate_cards.id) as vehicleCount'),
        dt('MIN(corporate_cards.requestDate)', 'requestDate'),
        dt('MAX(corporate_cards.approvedDate)', 'approvedDate'),
        knex.raw('MAX(corporate_cards.approvalRemarks) as approvalRemarks'),
        knex.raw(
          "GROUP_CONCAT(corporate_cards.vehicleNumber ORDER BY corporate_cards.id SEPARATOR ',') as vehicles",
        ),
        knex.raw(
          "GROUP_CONCAT(corporate_cards.vehicleType ORDER BY corporate_cards.id SEPARATOR ',') as vehicleTypes",
        ),
        knex.raw(
          "GROUP_CONCAT(corporate_cards.id ORDER BY corporate_cards.id SEPARATOR ',') as cardIds",
        ),
        dt('MAX(corporate_cards.updatedAt)', 'updatedAt'),
        knex.raw(
          "GROUP_CONCAT(corporate_cards.status ORDER BY corporate_cards.id SEPARATOR ',') as allStatuses",
        ),
        knex.raw('MAX(corporate_cards.cardStatus) as cardStatus'),
      )
      .groupBy('corporate_cards.requestId')
      .orderByRaw('MAX(corporate_cards.createdAt) DESC')
      .limit(pageSize)
      .offset(offset);
    this.applyCardSearch(groupsQ, search);
    const groups: any[] = await groupsQ;

    const mapped = groups.map((g) => {
      const requestStatusList = splitList(g.allStatuses);
      const ss = [...new Set(requestStatusList)];
      const requestStatus =
        ss.includes('approved') && ss.includes('rejected')
          ? 'partial Approved'
          : ss[0] || null;
      return {
        ...g,
        requestStatus,
        requestStatusList,
        corporateId:
          g.corporateId || g.corporateId === 0 ? Number(g.corporateId) : null,
        vehicleCount: Number(g.vehicleCount),
        vehicles: splitList(g.vehicles),
        vehicleTypes: splitList(g.vehicleTypes).map((i) => (i ? Number(i) : null)),
        cardIds: splitList(g.cardIds).map(Number),
      };
    });

    const corporateIds = [
      ...new Set(mapped.map((g) => g.corporateId).filter(Boolean)),
    ];
    let corporateMap: Record<number, string> = {};
    if (corporateIds.length) {
      const rows: any[] = await knex('corporates')
        .whereIn('id', corporateIds)
        .select('id', 'name');
      corporateMap = rows.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
    }
    const typeMap = await this.vehicleTypeMap(mapped.flatMap((g) => g.vehicleTypes));

    const data = mapped.map((g) => ({
      ...g,
      corporateName: g.corporateId ? corporateMap[g.corporateId] || null : null,
      vehicleTypeNames: g.vehicleTypes.length
        ? g.vehicleTypes.map((id) => (id ? typeMap[id] || String(id) : null))
        : [],
    }));

    const count = Number(total) || 0;
    return { count, data, page, pageSize, totalPages: Math.ceil(count / pageSize) };
  }

  // GET api/corporate-cards/qr-codes  (legacy findAllCorporateQrCodes)
  async findAllQrCodes(dto: CorporateCardQrCodesQueryDto) {
    const page = toPositiveInt(dto?.page, 1);
    const pageSize = toPositiveInt(dto?.pageSize, 10);
    const search = (dto?.search || '').trim();
    const knex = CorporateQrCode.knex();

    const query = CorporateQrCode.query()
      .withGraphFetched(
        'corporateQrCorporateCard(selectCard).[corporateCardsCorporate(selectIdName), corporateCardsVehicleType(selectIdName)]',
      )
      .modifiers({
        selectCard: (b: any) =>
          b.select(
            'id',
            'corporate',
            'vehicleNumber',
            'vehicleType',
            'requestId',
            'status',
            'cardStatus',
          ),
        selectIdName: (b: any) => b.select('id', 'name'),
      })
      .orderBy('corporate_qr_code.createdDateTime', 'desc');

    if (search) {
      const like = `%${search}%`;
      query.where((b: any) => {
        b.where('corporate_qr_code.vehicleNumber', 'like', like)
          .orWhere('corporate_qr_code.vehicleType', 'like', like)
          .orWhere('corporate_qr_code.companyName', 'like', like)
          .orWhere('corporate_qr_code.tokenNumber', 'like', like)
          .orWhere('corporate_qr_code.deviceId', 'like', like)
          .orWhereIn(
            'corporate_qr_code.corporateCardId',
            knex('corporate_cards as cc')
              .leftJoin('corporates as c', 'c.id', 'cc.corporate')
              .leftJoin('vehicle_type as vt', 'vt.id', 'cc.vehicleType')
              .select('cc.id')
              .where((s: any) =>
                s
                  .where('cc.vehicleNumber', 'like', like)
                  .orWhere('c.name', 'like', like)
                  .orWhere('vt.name', 'like', like),
              ),
          )
          .orWhereRaw(
            "DATE_FORMAT(corporate_qr_code.createdDateTime, '%Y-%m-%d %H:%i:%s') LIKE ?",
            [like],
          );
      });
    }

    const result: any = await CorporateQrCode.pagination(query, {
      query: { page, limit: pageSize },
    });

    const data = (result.results || []).map((r: any) => {
      const { corporateQrCorporateCard: card, ...qr } = r;
      if (!card) return { ...qr, corporateQrCorporateCard: null };
      const { corporateCardsCorporate, corporateCardsVehicleType, ...c } = card;
      return {
        ...qr,
        corporateQrCorporateCard: {
          ...toLegacyCard(c),
          corporateCardsCorporate: corporateCardsCorporate || null,
          corporateCardsVehicleType: corporateCardsVehicleType || null,
        },
      };
    });

    const count = Number(result.total) || 0;
    return {
      count,
      data,
      page,
      pageSize,
      totalPages: result.meta?.totalPages ?? Math.ceil(count / pageSize),
    };
  }

  // PUT api/corporate-cards/bulk-decision  (legacy corporateCardsService.bulkDecision)
  async bulkDecision(dto: CorporateCardBulkDecisionDto, authId?: number) {
    const approveIds = dto?.approveIds ?? [];
    const rejectIds = dto?.rejectIds ?? [];
    if (!Array.isArray(approveIds) || !Array.isArray(rejectIds)) {
      AppException.badRequest({
        message: 'approveIds and rejectIds must be arrays',
      });
    }
    if (approveIds.length === 0 && rejectIds.length === 0) {
      AppException.badRequest({
        message: 'At least one of approveIds or rejectIds must be non-empty',
      });
    }

    const approveSet = new Set(approveIds.map(Number));
    const rejectSet = new Set(rejectIds.map(Number));
    const allIds = [...new Set([...approveSet, ...rejectSet])].filter((n) =>
      Number.isFinite(n),
    );

    const knex = CorporateCards.knex();
    const cards: any[] = allIds.length
      ? await knex('corporate_cards').whereIn('id', allIds)
      : [];
    if (!cards.length) {
      AppException.notFound({ message: 'No cards found for the provided ids' });
    }

    const approvedBy =
      dto?.approvedBy !== undefined &&
      dto?.approvedBy !== null &&
      `${dto.approvedBy}` !== ''
        ? Number(dto.approvedBy)
        : (authId ?? null);
    const approvalRemarks = dto?.approvalRemarks || null;
    const now = nowWallClock();
    const otpExpired = moment()
      .add(10, 'minutes')
      .format('YYYY-MM-DD HH:mm:ss');

    const updatedCards: any[] = [];
    await knex.transaction(async (trx: any) => {
      // Remove (soft delete) prior request notifications for all affected requestIds
      const affectedRequestIds = [
        ...new Set(cards.map((c) => c.requestId).filter(Boolean)),
      ];
      for (const rid of affectedRequestIds) {
        await softDeleteNotificationsByRequestId(trx, rid as string);
      }

      for (const card of cards) {
        const cardId = Number(card.id);
        const action = approveSet.has(cardId)
          ? 'approved'
          : rejectSet.has(cardId)
            ? 'rejected'
            : null;
        if (!action) continue;

        const patch: any = {
          status: action,
          approvedBy,
          approvedDate: now,
          approvalRemarks,
          updatedAt: now,
        };
        if (action === 'approved') {
          patch.cardStatus = 'active';
          patch.otpCode = generateOtp(6);
          patch.otpExpired = otpExpired;
        } else {
          patch.cardStatus = 'revoked';
        }

        await trx('corporate_cards').where('id', cardId).update(patch);
        updatedCards.push({ ...toLegacyCard({ ...card, ...patch }), action });
      }
    });

    const typeMap = await this.vehicleTypeMap(
      updatedCards.map((r) => r.vehicleType),
    );
    const result = updatedCards.map((r) => ({
      ...r,
      vehicleTypeName: r.vehicleType ? typeMap[r.vehicleType] || null : null,
    }));

    // One portal notification per corporate
    const byCorporate: Record<string, { approved: any[]; rejected: any[] }> =
      {};
    for (const r of result) {
      const cid = r.corporateId;
      if (!cid) continue;
      if (!byCorporate[cid]) byCorporate[cid] = { approved: [], rejected: [] };
      if (r.action === 'approved') byCorporate[cid].approved.push(r);
      else byCorporate[cid].rejected.push(r);
    }

    for (const [cid, groups] of Object.entries(byCorporate)) {
      const approvedCount = groups.approved.length;
      const rejectedCount = groups.rejected.length;
      const title =
        approvedCount && rejectedCount
          ? 'Card Request Decision'
          : approvedCount
            ? 'Card Request Approved'
            : 'Card Request Rejected';
      const parts: string[] = [];
      if (approvedCount) parts.push(`${approvedCount} vehicle(s) approved`);
      if (rejectedCount) parts.push(`${rejectedCount} vehicle(s) rejected`);
      await insertPortalNotification(knex, {
        title,
        message: `Bulk decision applied: ${parts.join(', ')}.`,
        portalType: 'corporate',
        corporateId: Number(cid),
        data: {
          type: 'corporateCardBulkDecision',
          approvedCardIds: groups.approved.map((r) => r.id),
          rejectedCardIds: groups.rejected.map((r) => r.id),
          approvedVehicles: groups.approved.map((r) => r.vehicleNumber),
          rejectedVehicles: groups.rejected.map((r) => r.vehicleNumber),
        },
        createdBy: authId ?? 16,
      });
    }

    return {
      updated: result.length,
      approvedCount: result.filter((r) => r.action === 'approved').length,
      rejectedCount: result.filter((r) => r.action === 'rejected').length,
      cards: result,
    };
  }
}
