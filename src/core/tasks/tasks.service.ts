import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor() {}

  // Run every Friday at midnight
  @Cron('0 0 * * 5')
  async tst() {}
}
