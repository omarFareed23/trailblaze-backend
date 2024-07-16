import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WayDetailsModule } from './way-details/way-details.module';
import { WayDetails } from './way-details/way-details.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RoutesModule } from './routes/routes.module';
import { LambdaService } from './lambda/lambda.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [WayDetails],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
        // extra: {
        //   options: `project=${configService.get<string>('ENDPOINT_ID')}`,
        // },
      }),
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    UsersModule,
    WayDetailsModule,
    RoutesModule,
  ],
  providers: [LambdaService],
})
export class AppModule {}
