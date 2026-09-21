import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNamesEnum } from 'src/core/helper/enum/global.enum';

import { NotificationActions } from 'src/notifications/notification-actions';

@Processor(QueueNamesEnum.TaskQueue)
export class AppQueueProcessor extends WorkerHost {
  constructor(private readonly notificationActions: NotificationActions) {
    super();
  }

  async process(job: Job, _token?: string): Promise<any> {
    const { name, data } = job;

    try {
      switch (name) {
        case QueueNamesEnum.FollowUser: {
          const { senderId, receiverId, item } = data;
          await this.notificationActions.userFollow({
            senderId,
            receiverId,
            item,
          });

          break;
        }

        default:
          console.warn(`Unhandled job name: ${name}`);
          return false;
      }
    } catch (error) {
      console.error(`Error processing job ${name}:`, error);
      return false;
    }
  }
}
