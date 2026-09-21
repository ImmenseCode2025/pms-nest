import { Injectable } from '@nestjs/common';
import {
  NotificationRelatedTypeEnum,
  NotificationTitleEnum,
  NotificationTypeEnum,
} from 'src/core/helper/enum/global.enum';
import { GlobalHelper } from 'src/core/helper/global-helper';
import { CustomLoggerService } from 'src/core/logger/custom-logger.service';
import { Notifications } from 'src/core/orm/entities/notification.entity';
import { Users } from 'src/core/orm/entities/users.entity';
import { SocketGateway } from 'src/core/socket-gateway/socket.gateway';

@Injectable()
export class NotificationActions {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly customLoggerService: CustomLoggerService,
  ) {}

  async addFriend({ senderId, receiverId, item }) {
    try {
      let user: any = await Users.query().where({ id: senderId }).first();
      let text = `${user?.first_name} ${user?.last_name} Sent you a friend request.`;
      await this.notification({
        title: NotificationTitleEnum.FriendRequest,
        text: text,
        sourceId: item?.id,
        senderId: senderId,
        receiverIds: [receiverId],
        type: NotificationTypeEnum.AddFriend,
        relatedId: item?.id,
        relatedType: NotificationRelatedTypeEnum.Friend,
      });
      return true;
    } catch (err) {
      await this.customLoggerService.error(err);
      return false;
    }
  }

  async acceptFriend({ senderId, receiverId, item }) {
    try {
      let user: any = await Users.query().where({ id: senderId }).first();
      let text = `${user?.first_name} ${user?.last_name} accepted your friend request.`;
      await this.notification({
        title: NotificationTitleEnum.AcceptRequest,
        text: text,
        sourceId: item?.id,
        senderId: senderId,
        receiverIds: [receiverId],
        type: NotificationTypeEnum.AcceptRequest,
        relatedId: item?.id,
        relatedType: NotificationRelatedTypeEnum.Friend,
      });
      return true;
    } catch (err) {
      await this.customLoggerService.error(err);
      return false;
    }
  }

  async addCruise({ senderId, receiverIds, item }) {
    try {
      let user: any = await Users.query().where({ id: senderId }).first();
      let text = `${user?.first_name} ${user?.last_name} invited you to join a new cruise.`;
      await this.notification({
        title: NotificationTitleEnum.NewCruise,
        text: text,
        sourceId: item?.id,
        senderId: senderId,
        receiverIds: receiverIds,
        type: NotificationTypeEnum.NewCruise,
        relatedId: item?.id,
        relatedType: NotificationRelatedTypeEnum.Cruise,
      });
      return true;
    } catch (err) {
      await this.customLoggerService.error(err);
      return false;
    }
  }

  async userFollow({ senderId, receiverId, item }) {
    try {
      let user: any = await Users.query().where({ id: senderId }).first();
      let text = `${user?.user_name} started following you.`;
      await this.notification({
        title: NotificationTitleEnum.FollowUser,
        text: text,
        sourceId: item?.id,
        senderId: senderId,
        receiverIds: [receiverId],
        type: NotificationTypeEnum.FollowUser,
        relatedId: item?.id,
        relatedType: NotificationRelatedTypeEnum.User,
      });
      return true;
    } catch (err) {
      await this.customLoggerService.error(err);
      return false;
    }
  }

  async postLike({ senderId, receiverId, postId }) {
    try {
      let user: any = await Users.query().where({ id: senderId }).first();
      let text = `${user?.user_name} liked your post.`;
      await this.notification({
        title: NotificationTitleEnum.PostLike,
        text: text,
        sourceId: postId,
        senderId: senderId,
        receiverIds: [receiverId],
        type: 'post', // User specified 'post'
        relatedId: postId,
        relatedType: 'post', // User specified 'post'
      });
      return true;
    } catch (err) {
      await this.customLoggerService.error(err);
      return false;
    }
  }

  async notification({
    title,
    text,
    sourceId,
    senderId,
    receiverIds,
    type,
    relatedId,
    relatedType,
  }) {
    try {
      const notificationData: any = {
        title: title,
        text: text,
        source_id: sourceId,
        sender_id: senderId,
        type: type,
        related_id: relatedId,
        related_type: relatedType,
      };

      if (receiverIds?.length > 0) {
        notificationData.receivers = receiverIds.map((id) => ({
          receiver_id: id,
        }));
      }

      let notification: any =
        await Notifications.query().insertGraph(notificationData);

      if (receiverIds?.length > 0) {
        let deviceTokens: any = await GlobalHelper.multipleDeviceTokenByUsers({
          ids: receiverIds,
        });

        // await FcmHelper.sendMessageNotification({
        //   data: notification,
        //   deviceTokens: deviceTokens,
        //   notification: { title: title, body: text },
        // });

        // for (const item of receiverIds) {
        //   await this.socketGateway.userNotificationCount({ receiverId: item });
        // }
      }
    } catch (err) {
      await this.customLoggerService.error(err);

      console.log(err);
    }
  }
}
