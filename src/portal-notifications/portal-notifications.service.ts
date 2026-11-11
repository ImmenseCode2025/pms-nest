import { Injectable } from '@nestjs/common';
import { PortalNotification } from 'src/core/orm/entities/portal-notification.entity';
import { PortalNotificationListDto } from './dto/portal-notification-list.dto';
import { PortalNotificationReadAllDto } from './dto/portal-notification-read-all.dto';

// portal_notifications is soft-deleted (legacy Sequelize paranoid: deletedAt).
// Scoping (same as legacy): by portalType only — admin-portal notifications are a
// shared inbox (user column is NULL). Rows targeted at a specific user (user set)
// are additionally limited to that logged-in user.
@Injectable()
export class PortalNotificationsService {
  private visible(query: any, authId?: number) {
    query.whereNull('portal_notifications.deletedAt');
    query.where((b: any) => {
      b.whereNull('portal_notifications.user');
      if (authId) b.orWhere('portal_notifications.user', authId);
    });
    return query;
  }

  private normalize(row: any) {
    const r = row?.toJSON ? row.toJSON() : { ...row };
    let data = r.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        // keep raw string
      }
    }
    return {
      ...r,
      userId: r.user ?? null,
      data,
      read: !!r.read,
    };
  }

  // -> { notifications: [...], count, unreadCount }
  async list(dto: PortalNotificationListDto = {}, authId?: number) {
    const listQuery = this.visible(PortalNotification.query(), authId);
    const unreadQuery = this.visible(PortalNotification.query(), authId).where(
      'portal_notifications.read',
      false,
    );
    if (dto.portalType) {
      listQuery.where('portal_notifications.portalType', dto.portalType);
      unreadQuery.where('portal_notifications.portalType', dto.portalType);
    }
    listQuery
      .orderBy('portal_notifications.createdAt', 'desc')
      .orderBy('portal_notifications.id', 'desc');

    const [rows, unread]: any = await Promise.all([
      listQuery,
      unreadQuery.count('* as total').first(),
    ]);
    const notifications = (rows || []).map((r: any) => this.normalize(r));
    return {
      notifications,
      count: notifications.length,
      unreadCount: Number(unread?.total || 0),
    };
  }

  // Idempotent like legacy: no error if the id does not exist
  async markAsRead(id: number, authId?: number) {
    const affected = await this.visible(PortalNotification.query(), authId)
      .where('portal_notifications.id', id)
      .patch({ read: true, updatedAt: PortalNotification.knex().fn.now() } as any);
    return { id, read: true, affected: Number(affected) || 0 };
  }

  async markAllAsRead(dto: PortalNotificationReadAllDto = {}, authId?: number) {
    const query = this.visible(PortalNotification.query(), authId).where(
      'portal_notifications.read',
      false,
    );
    if (dto.portalType) query.where('portal_notifications.portalType', dto.portalType);
    if (dto.userId) query.where('portal_notifications.user', Number(dto.userId));
    if (dto.corporateId) query.where('portal_notifications.corporateId', Number(dto.corporateId));
    const affected = await query.patch({
      read: true,
      updatedAt: PortalNotification.knex().fn.now(),
    } as any);
    return { portalType: dto.portalType ?? null, affected: Number(affected) || 0 };
  }

  // Soft delete (sets deletedAt), idempotent like legacy
  async remove(id: number, authId?: number) {
    const affected = await this.visible(PortalNotification.query(), authId)
      .where('portal_notifications.id', id)
      .patch({ deletedAt: PortalNotification.knex().fn.now() } as any);
    return { id, affected: Number(affected) || 0 };
  }
}
