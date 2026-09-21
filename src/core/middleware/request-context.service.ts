import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request } from 'express';

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<Request>();

  run(req: Request, next: () => void) {
    this.als.run(req, next);
  }

  getRequest(): Request | undefined {
    return this.als.getStore();
  }
}
