import { Module } from '@nestjs/common';
import { AppQueueModule } from '../app-queue/app-queue.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [AppQueueModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
