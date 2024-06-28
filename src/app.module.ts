import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), RedisModule, UsersModule],
})
export class AppModule {}
