import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNamesEnum } from 'src/core/helper/enum/global.enum';

@Injectable()
export class AppQueueService {
  constructor(
    @InjectQueue(QueueNamesEnum.TaskQueue) private taskQueue: Queue,
  ) {}

  async followUser({ senderId, receiverId, item }) {
    await this.taskQueue.add(QueueNamesEnum.FollowUser, {
      senderId,
      receiverId,
      item,
    });
  }
}
