import { Injectable } from '@nestjs/common';
import { Corporate } from 'src/core/orm/entities/corporate.entity';
import { CorporateCards } from 'src/core/orm/entities/corporate-cards.entity';
import { Operator } from 'src/core/orm/entities/operator.entity';
import { SyncChanges } from 'src/core/orm/entities/sync-changes.entity';

// Abhi commit ho rahi transactions ki IDs miss na hon — itne second purani changes hi do
const SETTLE_SECONDS = 5;

// Site server ko sirf yeh fields jayenge
const CORPORATE_FIELDS = ['id', 'name', 'status', 'site_id'];

// Local `vip_vehicles` table jaisi shape (company_id = corporate id)
const CARD_FIELDS = ['id', 'site_id', 'company_id', 'owner_name', 'vehicle_number'];

// operators table k saare columns
const OPERATOR_FIELDS = [
  'id',
  'username',
  'mobile',
  'email',
  'cnic',
  'site_id',
  'supervisor_id',
  'password',
  'profile_image',
  'status',
  'created_at',
  'updated_at',
];

export interface SyncResponse {
  full: boolean; // true = poori list (pehli sync), false = sirf changes
  last_change_id: number; // agli request mein after_id
  has_more: boolean; // true = foran dobara call karo
  records: Record<string, any>[]; // add / update
  deleted_ids: number[]; // delete ho gaye ya ab is site k nahi rahe
}

@Injectable()
export class SyncService {
  // ---------------- corporates ----------------

  async corporates(siteId: number, afterId: number, limit: number): Promise<SyncResponse> {
    const tables = ['corporates'];
    const query = () => Corporate.query().where('site_id', siteId).select(CORPORATE_FIELDS);

    if (!afterId) return this.full(tables, query(), CORPORATE_FIELDS);

    const changes = await this.changes(tables, afterId, limit);
    if (!changes.length) return this.empty(afterId);

    const recordIds = [...new Set(changes.map((c) => Number(c.record_id)))];
    const current: any[] = await query().whereIn('id', recordIds);
    return this.delta(changes, limit, recordIds, current, CORPORATE_FIELDS);
  }

  // ---------------- corporate_cards -> local vip_vehicles ----------------

  async corporateCards(siteId: number, afterId: number, limit: number): Promise<SyncResponse> {
    // Corporate ki site_id badle ya corporate delete ho to us k cards bhi move / delete hon
    const tables = ['corporate_cards', 'corporates'];

    // Sirf approved + active cards, jin ka corporate is site ka hai
    const query = () =>
      CorporateCards.query()
        .join('corporates', 'corporates.id', 'corporate_cards.corporate')
        .where('corporates.site_id', siteId)
        .where('corporate_cards.status', 'approved')
        .where('corporate_cards.cardStatus', 'active')
        .select(
          'corporate_cards.id',
          'corporates.site_id',
          'corporate_cards.corporate as company_id',
          'corporate_cards.ownerName as owner_name',
          'corporate_cards.vehicleNumber as vehicle_number',
        );

    if (!afterId) return this.full(tables, query(), CARD_FIELDS);

    const changes = await this.changes(tables, afterId, limit);
    if (!changes.length) return this.empty(afterId);

    const cardIds = changes.filter((c) => c.table_name === 'corporate_cards').map((c) => Number(c.record_id));
    const corporateIds = changes.filter((c) => c.table_name === 'corporates').map((c) => Number(c.record_id));
    if (corporateIds.length) {
      const cards: any[] = await CorporateCards.query().whereIn('corporate', corporateIds).select('id');
      cardIds.push(...cards.map((c) => Number(c.id)));
    }

    const recordIds = [...new Set(cardIds)];
    const current: any[] = recordIds.length ? await query().whereIn('corporate_cards.id', recordIds) : [];
    return this.delta(changes, limit, recordIds, current, CARD_FIELDS);
  }

  // ---------------- operators (saare columns) ----------------

  async operators(siteId: number, afterId: number, limit: number): Promise<SyncResponse> {
    const tables = ['operators'];
    const query = () => Operator.query().where('site_id', siteId).select(OPERATOR_FIELDS);

    if (!afterId) return this.full(tables, query(), OPERATOR_FIELDS);

    const changes = await this.changes(tables, afterId, limit);
    if (!changes.length) return this.empty(afterId);

    // Operator delete hua ya kisi aur site par gaya — deleted_ids mein jayega
    const recordIds = [...new Set(changes.map((c) => Number(c.record_id)))];
    const current: any[] = await query().whereIn('id', recordIds);
    return this.delta(changes, limit, recordIds, current, OPERATOR_FIELDS);
  }

  // ---------------- common ----------------

  // Pehli sync: poori list + aakhri change id (list sy PEHLE lo, taake beech ki change miss na ho)
  private async full(tables: string[], query: any, fields: string[]): Promise<SyncResponse> {
    const maxRow: any = await SyncChanges.query().whereIn('table_name', tables).max('id as max_id').first();
    const records: any[] = await query;

    return {
      full: true,
      last_change_id: Number(maxRow?.max_id) || 0,
      has_more: false,
      records: records.map((r) => this.pick(r, fields)),
      deleted_ids: [],
    };
  }

  private async changes(tables: string[], afterId: number, limit: number): Promise<any[]> {
    return await SyncChanges.query()
      .whereIn('table_name', tables)
      .where('id', '>', afterId)
      .whereRaw(`created_at < NOW() - INTERVAL ${SETTLE_SECONDS} SECOND`)
      .orderBy('id', 'asc')
      .limit(limit);
  }

  // Ek record ki kai changes ho sakti hain — bas current state bhejo.
  // Jo id ab is site k result mein nahi (delete / site badli / card inactive) — site server sy hatao
  private delta(changes: any[], limit: number, recordIds: number[], current: any[], fields: string[]): SyncResponse {
    const currentIds = new Set(current.map((r) => Number(r.id)));
    return {
      full: false,
      last_change_id: Number(changes[changes.length - 1].id),
      has_more: changes.length === limit,
      records: current.map((r) => this.pick(r, fields)),
      deleted_ids: recordIds.filter((id) => !currentIds.has(id)),
    };
  }

  private empty(afterId: number): SyncResponse {
    return { full: false, last_change_id: afterId, has_more: false, records: [], deleted_ids: [] };
  }

  // Sirf allowed fields — model ka $formatJson ya extra columns bahar na jayein
  private pick(row: any, fields: string[]) {
    const out: Record<string, any> = {};
    for (const f of fields) out[f] = f === 'id' ? Number(row[f]) : row[f];
    return out;
  }
}
