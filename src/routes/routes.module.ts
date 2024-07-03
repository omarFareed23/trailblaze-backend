import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
