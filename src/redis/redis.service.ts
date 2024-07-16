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
    const type = await this.redisClient.type(key);
    if (type === 'set') {
      return this.redisClient.scard(key);
    } else if (type === 'list') {
      return this.redisClient.llen(key);
    } else if (type == 'none') {
      return 0;
      // }
    } else {
      throw new Error(`Key ${key} is not a set or list2, but a ${type}`);
    }
  }

  async incrBy(key: string, value: number): Promise<number> {
    return this.redisClient.incrby(key, value);
  }

  async addToSet(key: string, value: string) {
    return this.redisClient.sadd(key, value);
  }

  async removeFromSet(key: string, value: string) {
    return this.redisClient.srem(key, value);
  }

  // Add the new method to get all members of a set
  async getSetMembers(key: string): Promise<string[]> {
    const type = await this.redisClient.type(key);
    if (type === 'set') {
      return this.redisClient.smembers(key);
    } else if (type == null) {
      return [];
    } else {
      throw new Error(`Key ${key} is not a set, but a ${type}`);
    }
  }

  async del(key) {
    return this.redisClient.del(key);
  }
}
