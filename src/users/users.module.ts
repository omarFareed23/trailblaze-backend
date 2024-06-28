import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RedisService } from 'src/redis/redis.service';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.constants';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });
      },
    },
    RedisService,
  ],
  // imports: [RedisModule],
})
export class UsersModule {}
