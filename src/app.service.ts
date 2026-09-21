import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<any> {
    return 'PMS NEST JS  API is running';
  }

  async productionTest(): Promise<any> {
    return 'PMS NEST JS  API is running in production mode';
  }
}
