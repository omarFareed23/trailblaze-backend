import { Module } from '@nestjs/common';
import { WayDetailsService } from './way-details.service';
import { WayDetailsController } from './way-details.controller';
import { REDIS_CLIENT } from 'src/redis/redis.keys';
import { Redis } from 'ioredis';
import { RedisService } from 'src/redis/redis.service';
import { WayDetailsRepository } from './way-details.repository';

@Module({
  controllers: [WayDetailsController],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });
      },
    },
    WayDetailsService,
    RedisService,
    WayDetailsRepository,
  ],
})
export class WayDetailsModule {}
