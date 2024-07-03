import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { TrackUserDto } from './dtos/track-user.dto';
import { ReportAccidentDto } from './dtos/report-accident.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('track')
  trackUser(@Body() trackUserDto: TrackUserDto) {
    return this.usersService.trackUser(trackUserDto);
  }

  @Post('accidents-report')
  reportAccident(@Body() reportAccidentDto: ReportAccidentDto) {
    return this.usersService.reportAccident(reportAccidentDto);
  }
}
