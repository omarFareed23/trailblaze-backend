import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { ConfigModule } from '@nestjs/config';
import { ExecService } from './exec.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LambdaService } from 'src/lambda/lambda.service';
import { RedisService } from 'src/redis/redis.service';
import { REDIS_CLIENT } from 'src/redis/redis.keys';
import { Redis } from 'ioredis';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([]),
  ],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    ExecService,
    LambdaService,
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
})
export class RoutesModule {}
