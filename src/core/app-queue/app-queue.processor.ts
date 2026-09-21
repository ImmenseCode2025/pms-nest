import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNamesEnum } from 'src/core/helper/enum/global.enum';

@Processor(QueueNamesEnum.TaskQueue)
export class AppQueueProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job, _token?: string): Promise<any> {
    const { name, data } = job;

    try {
      switch (name) {
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
