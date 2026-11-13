import { Injectable } from '@nestjs/common';
import { AppException } from 'src/core/exception/app-exception';
import { SyncChanges } from 'src/core/orm/entities/sync-changes.entity';
import { SYNC_TABLES, SyncTable } from './sync.tables';

// Abhi commit ho rahi transactions ki IDs miss na hon — itne second purani changes hi do
const SETTLE_SECONDS = 5;

export interface SyncResponse {
  full: boolean; // true = poori list (pehli sync), false = sirf changes
  last_change_id: number; // agli request mein after_id
  has_more: boolean; // true = foran dobara call karo
  records: Record<string, any>[]; // add / update (sirf allowed fields)
  deleted_ids: number[]; // live sy delete ho gaye
}

@Injectable()
export class SyncService {
  async changes(tableName: string, afterId: number, limit: number): Promise<SyncResponse> {
    const table = SYNC_TABLES[tableName];
    if (!table) {
      AppException.notFound({ message: `Table "${tableName}" is not synced` });
    }
    const take = Math.min(Math.max(limit || 500, 1), 1000);

    return afterId ? this.delta(tableName, table, afterId, take) : this.full(tableName, table);
  }

  // Pehli sync: poori list + abhi tak ka aakhri change id (list sy PEHLE lo, taake beech ki change miss na ho)
  private async full(tableName: string, table: SyncTable): Promise<SyncResponse> {
    const maxRow: any = await SyncChanges.query()
      .where('table_name', tableName)
      .max('id as max_id')
      .first();
    const records: any[] = await table.model.query().select(table.fields);

    return {
      full: true,
      last_change_id: Number(maxRow?.max_id) || 0,
      has_more: false,
      records: records.map((r) => this.pick(r, table.fields)),
      deleted_ids: [],
    };
  }

  // Baad ki syncs: sirf afterId k baad ki changes
  private async delta(tableName: string, table: SyncTable, afterId: number, take: number): Promise<SyncResponse> {
    const changes: any[] = await SyncChanges.query()
      .where('table_name', tableName)
      .where('id', '>', afterId)
      .whereRaw(`created_at < NOW() - INTERVAL ${SETTLE_SECONDS} SECOND`)
      .orderBy('id', 'asc')
      .limit(take);

    if (!changes.length) {
      return { full: false, last_change_id: afterId, has_more: false, records: [], deleted_ids: [] };
    }

    // Ek record ki kai changes ho sakti hain — bas us ki current state bhejo
    const recordIds = [...new Set(changes.map((c) => Number(c.record_id)))];
    const current: any[] = await table.model.query().whereIn('id', recordIds).select(table.fields);
    const existingIds = new Set(current.map((r) => Number(r.id)));

    return {
      full: false,
      last_change_id: Number(changes[changes.length - 1].id),
      has_more: changes.length === take,
      records: current.map((r) => this.pick(r, table.fields)),
      deleted_ids: recordIds.filter((id) => !existingIds.has(id)),
    };
  }

  // Sirf allowed fields — model ka $formatJson ya extra columns bahar na jayein
  private pick(row: any, fields: string[]) {
    const out: Record<string, any> = {};
    for (const f of fields) out[f] = f === 'id' ? Number(row[f]) : row[f];
    return out;
  }
}
