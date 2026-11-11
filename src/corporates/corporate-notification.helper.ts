import moment from 'moment';

/**
 * Direct knex helpers for `portal_notifications` used by the corporate /
 * corporate-card approval flows (ported from legacy portalNotificationService).
 * Kept local so these modules do not depend on the notifications module.
 */

/** Pakistan wall-clock "now" (DB stores wall-clock time, connection tz is 'Z'). */
export const nowWallClock = (): string => moment().format('YYYY-MM-DD HH:mm:ss');

export interface CorporatePortalNotification {
  title: string;
  message: string;
  portalType: 'user' | 'admin' | 'mobile' | 'corporate';
  corporateId?: number | null;
  userId?: number | null;
  data?: any;
  createdBy?: number | null;
}

export async function insertPortalNotification(
  knex: any,
  n: CorporatePortalNotification,
) {
  const now = nowWallClock();
  await knex('portal_notifications').insert({
    title: n.title,
    message: n.message,
    user: n.userId ?? null,
    corporateId: n.corporateId ?? null,
    createdBy: n.createdBy ?? null,
    portalType: n.portalType,
    data: n.data === undefined ? null : JSON.stringify(n.data),
    read: 0,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Soft-deletes (paranoid, like legacy Sequelize `destroy`) every notification
 * whose JSON `data.requestId` equals the given request id.
 */
export async function softDeleteNotificationsByRequestId(
  knex: any,
  requestId: string,
) {
  await knex('portal_notifications')
    .whereNull('deletedAt')
    .whereRaw("JSON_UNQUOTE(JSON_EXTRACT(`data`, '$.requestId')) = ?", [
      String(requestId),
    ])
    .update({ deletedAt: nowWallClock() });
}
