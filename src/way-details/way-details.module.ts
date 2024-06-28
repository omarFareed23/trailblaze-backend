import { Module } from '@nestjs/common';
import { WayDetailsService } from './way-details.service';
import { WayDetailsController } from './way-details.controller';

@Module({
  controllers: [WayDetailsController],
  providers: [WayDetailsService],
})
export class WayDetailsModule {}
