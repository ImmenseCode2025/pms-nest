import { Injectable } from '@nestjs/common';
import { Corporate } from 'src/core/orm/entities/corporate.entity';
import { SyncChanges } from 'src/core/orm/entities/sync-changes.entity';

// Abhi commit ho rahi transactions ki IDs miss na hon — itne second purani changes hi do
const SETTLE_SECONDS = 5;

// Site server ko sirf yeh fields jayenge
const CORPORATE_FIELDS = ['id', 'name', 'status', 'site_id'];

export interface SyncResponse {
  full: boolean; // true = poori list (pehli sync), false = sirf changes
  last_change_id: number; // agli request mein after_id
  has_more: boolean; // true = foran dobara call karo
  records: Record<string, any>[]; // add / update
  deleted_ids: number[]; // delete ho gaye ya kisi aur site par chale gaye
}

@Injectable()
export class SyncService {
  async corporates(siteId: number, afterId: number, limit: number): Promise<SyncResponse> {
    const take = Math.min(Math.max(limit, 1), 1000);
    return afterId ? this.delta(siteId, afterId, take) : this.full(siteId);
  }

  // Pehli sync: is site ki poori list + aakhri change id (list sy PEHLE lo, taake beech ki change miss na ho)
  private async full(siteId: number): Promise<SyncResponse> {
    const maxRow: any = await SyncChanges.query()
      .where('table_name', 'corporates')
      .max('id as max_id')
      .first();
    const records: any[] = await Corporate.query().where('site_id', siteId).select(CORPORATE_FIELDS);

    return {
      full: true,
      last_change_id: Number(maxRow?.max_id) || 0,
      has_more: false,
      records: records.map((r) => this.pick(r)),
      deleted_ids: [],
    };
  }

  // Baad ki syncs: afterId k baad ki changes, sirf is site k corporates
  private async delta(siteId: number, afterId: number, take: number): Promise<SyncResponse> {
    const changes: any[] = await SyncChanges.query()
      .where('table_name', 'corporates')
      .where('id', '>', afterId)
      .whereRaw(`created_at < NOW() - INTERVAL ${SETTLE_SECONDS} SECOND`)
      .orderBy('id', 'asc')
      .limit(take);

    if (!changes.length) {
      return { full: false, last_change_id: afterId, has_more: false, records: [], deleted_ids: [] };
    }

    // Ek record ki kai changes ho sakti hain — bas current state bhejo
    const recordIds = [...new Set(changes.map((c) => Number(c.record_id)))];
    const current: any[] = await Corporate.query()
      .whereIn('id', recordIds)
      .where('site_id', siteId)
      .select(CORPORATE_FIELDS);
    const siteIds = new Set(current.map((r) => Number(r.id)));

    // Jo record ab is site ka nahi (delete hua ya site_id badli) — site server sy hatao
    return {
      full: false,
      last_change_id: Number(changes[changes.length - 1].id),
      has_more: changes.length === take,
      records: current.map((r) => this.pick(r)),
      deleted_ids: recordIds.filter((id) => !siteIds.has(id)),
    };
  }

  // Sirf allowed fields — model ka $formatJson ya extra columns bahar na jayein
  private pick(row: any) {
    const out: Record<string, any> = {};
    for (const f of CORPORATE_FIELDS) out[f] = f === 'id' ? Number(row[f]) : row[f];
    return out;
  }
}
