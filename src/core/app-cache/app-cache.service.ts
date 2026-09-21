import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from './app-cache.constants';

@Injectable()
export class AppCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) { }

  async set<T>({ key, value, ttl }: { key: string; value: T; ttl?: number }): Promise<T> {
    return this.cache.set(key, value, ttl ? ttl * 1000 : undefined);
  }

  async get<T>({ key }: { key: string }): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  async del({ key }: { key: string }): Promise<boolean> {
    return this.cache.del(key);
  }

  async expire({ key, ttl }: { key: string; ttl: number }): Promise<number> {
    return this.redisClient.expire(key, ttl);
  }
}
