import { Injectable, Logger } from '@nestjs/common';
import { LodashHelper } from 'src/core/helper/lodash-helper';
import { ParkingToken } from 'src/core/orm/entities/parking-token.entity';
import { PushedToken } from './dto/tokens-push.dto';

export interface TokensPushResult {
  accepted: string[]; // in uuids ko site server synced mark kare
  failed: { uuid: string; error: string }[]; // yeh agli push mein dobara aayenge
}

// Sirf insert par — baad mein nahi badalte
const INSERT_ONLY = ['syncUuid', 'generatedDateTime'];

// Insert + (naya version ho to) update
const UPDATABLE = [
  'localId',
  'tokenNumber',
  'carNo',
  'site',
  'vehicleType',
  'paymentMethod',
  'checkInDateTime',
  'checkOutDateTime',
  'status',
  'isExited',
  'amount',
  'checkInOperatorId',
  'checkOutOperatorId',
];

const INSERT_COLUMNS = [...INSERT_ONLY, ...UPDATABLE, 'syncVersion'];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Site server (realpark) k local `tokens` -> live `parking_token`
 * Key = syncUuid. Same version dobara aaye to kuch nahi badalta (idempotent),
 * purana version naye ko kabhi overwrite nahi karta (out-of-order requests safe).
 */
@Injectable()
export class TokensPushService {
  private readonly logger = new Logger('Sync:tokens-push');

  async push(siteId: number, records: PushedToken[]): Promise<TokensPushResult> {
    const result: TokensPushResult = { accepted: [], failed: [] };
    const rows: Record<string, any>[] = [];

    for (const r of records || []) {
      if (!r?.uuid || !UUID_RE.test(r.uuid) || !Number.isInteger(Number(r.version)) || Number(r.version) < 1) {
        result.failed.push({ uuid: r?.uuid ?? null, error: 'invalid uuid / version' });
        continue;
      }
      rows.push(this.toRow(siteId, r));
    }
    if (!rows.length) return result;

    try {
      await this.upsert(rows);
      result.accepted.push(...LodashHelper.map(rows, (r) => r.syncUuid));
    } catch (e: any) {
      // Batch mein koi ek row kharab (FK / data) — ek ek kar k, taake baaki na rukein
      this.logger.warn(`batch upsert failed (${e?.message}) — retrying row by row`);
      for (const row of rows) {
        try {
          await this.upsert([row]);
          result.accepted.push(row.syncUuid);
        } catch (err: any) {
          result.failed.push({ uuid: row.syncUuid, error: err?.message || String(err) });
        }
      }
    }

    this.logger.log(`site ${siteId}: accepted=${result.accepted.length} failed=${result.failed.length}`);
    return result;
  }

  private toRow(siteId: number, r: PushedToken): Record<string, any> {
    const completed = r.status === 'COMPLETED';
    const checkIn = toDate(r.check_in_at);
    return {
      syncUuid: r.uuid.toLowerCase(),
      generatedDateTime: checkIn ?? new Date(),
      localId: toInt(r.local_id),
      tokenNumber: r.token_number ?? '', // live par NOT NULL
      carNo: r.vehicle_number ? String(r.vehicle_number).slice(0, 10) : null, // live carNo varchar(10)
      site: siteId,
      vehicleType: toInt(r.vehicle_type_id),
      paymentMethod: toInt(r.payment_method_id),
      checkInDateTime: checkIn,
      checkOutDateTime: toDate(r.check_out_at),
      status: completed ? 'expired' : 'active',
      isExited: completed ? 1 : 0,
      amount: isBlank(r.amount) ? null : Number(r.amount),
      checkInOperatorId: toInt(r.check_in_operator_id),
      checkOutOperatorId: toInt(r.check_out_operator_id),
      syncVersion: Number(r.version),
    };
  }

  // MySQL 8.0.19+ (`AS new`). syncVersion wali line AAKHRI rehni chahiye — MySQL assignments
  // left -> right chalata hai, pehle badal di to baaki IF() purane version sy compare hi nahi karenge.
  private async upsert(rows: Record<string, any>[]) {
    const cols = INSERT_COLUMNS.map((c) => `\`${c}\``).join(', ');
    const tuple = `(${INSERT_COLUMNS.map(() => '?').join(', ')})`;
    const values = rows.map(() => tuple).join(', ');
    const bindings = rows.flatMap((r) => INSERT_COLUMNS.map((c) => r[c] ?? null));

    const newer = 'new.`syncVersion` > COALESCE(parking_token.`syncVersion`, 0)';
    const sets = UPDATABLE.map((c) => `\`${c}\` = IF(${newer}, new.\`${c}\`, parking_token.\`${c}\`)`);
    sets.push('`syncVersion` = GREATEST(COALESCE(parking_token.`syncVersion`, 0), new.`syncVersion`)');

    await ParkingToken.knex().raw(
      `INSERT INTO parking_token (${cols}) VALUES ${values} AS new ON DUPLICATE KEY UPDATE ${sets.join(', ')}`,
      bindings,
    );
  }
}

function isBlank(v: any): boolean {
  return LodashHelper.isNil(v) || v === '';
}

function toInt(v: any): number | null {
  if (isBlank(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toDate(v: any): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
