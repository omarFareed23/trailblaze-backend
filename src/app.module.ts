import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [RedisModule, UsersModule],
})
export class AppModule {}
