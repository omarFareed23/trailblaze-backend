import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
        });
      },
    },
    RedisService,
  ],
})
export class RedisModule {}
