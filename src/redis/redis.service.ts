import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.keys';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async geoadd(
    key: string,
    longitude: number,
    latitude: number,
    member: string,
  ): Promise<void> {
    await this.redisClient.geoadd(key, longitude, latitude, member);
  }

  async geoSearch(
    key: string,
    longitude: number,
    latitude: number,
    radius: number,
    unit: string,
  ) {
    return this.redisClient.georadius(
      key,
      longitude,
      latitude,
      radius,
      unit,
      'WITHDIST',
    );
  }

  async geodel(key: string, member: string): Promise<void> {
    await this.redisClient.zrem(key, member);
  }

  async geoRadiusByMember(
    key: string,
    member: string,
    radius: number,
    unit: string,
  ) {
    return this.redisClient.georadiusbymember(
      key,
      member,
      radius,
      unit,
      'WITHDIST',
    );
  }
  async listPush(key: string, value: string): Promise<void> {
    await this.redisClient.lpush(key, value);
  }

  async listPop(key: string): Promise<string> {
    return this.redisClient.lpop(key);
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async getKeys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async getSetL(key: string): Promise<number> {
    return this.redisClient.scard(key);
  }

  async incrBy(key: string, value: number): Promise<number> {
    return this.redisClient.incrby(key, value);
  }
}
