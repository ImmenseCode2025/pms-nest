import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { NotificationReceiver } from 'src/core/orm/entities/notification-receiver.entity';
import { Notifications } from 'src/core/orm/entities/notification.entity';
import { SocketGateway } from 'src/core/socket-gateway/socket.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async pagination(data: any = {}) {
    let authId = data.authId;
    let result: any = {};
    let query: any = {};
    query = Notifications.query();
    query.context({ authId: authId });
    query.withGraphFetched('sender');
    query.withGraphFetched('receiver');
    query.whereExists(
      Notifications.relatedQuery('receiver').where({ receiver_id: authId }),
    );
    query.orderBy('id', 'desc');
    result = await Notifications.pagination(query, data);
    return result;
  }

  async seenMyAllNotifications(authId) {
    await NotificationReceiver.query()
      .patch({ is_seen: true })
      .where({ receiver_id: authId, is_seen: false });
    // await this.socketGateway.userNotificationCount({ receiverId: req.user.id });

    return true;
  }

  async delete(id: number, authId: number) {
    let item: any = await NotificationReceiver.query()
      .where({
        notification_id: id,
        receiver_id: authId,
      })
      .first();
    if (!item) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    await NotificationReceiver.query().deleteById(item.id);
    return true;
  }
}
