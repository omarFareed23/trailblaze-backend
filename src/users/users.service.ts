import { Injectable } from '@nestjs/common';
import { TrackUserDto } from './dtos/track-user.dto';
import { RedisService } from 'src/redis/redis.service';
import {
  ACC_REPORT_GEOLOCATION,
  // ACC_REPORT_WAY,
  AGG_WAY_SPEED_COUNT,
  // AGG_WAY_USERS,
  AGG_WAY_USERS_SPEED,
  ALL_USERS_TRACKING,
  CHANGED_WAYS,
  GLOBAL_TRACKING,
  USER_MOVEMENT_TRACKING,
  USER_WAYS_TRACKING,
  WAY_TRACKING,
  WAY_USERS,
  WAY_USERS_SPEED,
} from '../redis/redis.keys';
import { ReportAccidentDto } from './dtos/report-accident.dto';
// import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { v4 as uuidv4 } from 'uuid';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
@Injectable()
export class UsersService {
  endTrip(userId: string) {
    return { status: 'success' };
  }
  async reportAccident(reportAccidentDto: ReportAccidentDto) {
    const { userId, geocoordinate, timestamp, wayId } = reportAccidentDto;

    await this.redisService.geoadd(
      `${ACC_REPORT_GEOLOCATION}${wayId}`,
      parseFloat(geocoordinate[0]),
      parseFloat(geocoordinate[1]),
      `${userId}|${timestamp}`,
    );
  }
  constructor(
    private readonly redisService: RedisService,
    @InjectConnection() private connection: Connection,
  ) {}

  async trackUser(trackUserDto: TrackUserDto) {
    // console.log(trackUserDto);
    const {
      'user-id': userId,
      // geocoordinate,
      timestamp = Date.now(),
      speed = 16.6667,
    } = trackUserDto;
    const geocoordinate = ['31.004619598388675', '30.033730488691315'];
    const ways = await this.connection.query(`
      SELECT id FROM ways WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint(${geocoordinate[0]}, ${geocoordinate[1]}), 4326), 0.01) ORDER BY ST_Distance(geom, ST_SetSRID(ST_MakePoint(${geocoordinate[0]},${geocoordinate[1]}),4326)) LIMIT 1;
      `);
    // console.log('WAYS : ', ways);
    if (ways.length == 0) return;
    const wayId = ways[0].id;
    // current date in milliseconds
    // const timestamp = Date.now();
    // console.log(await this.redisService.getKeys("*"));
    // return;

    const userWay = await this.redisService.get(
      `${USER_WAYS_TRACKING}${userId}`,
    );

    // console.log(
    //   `user entered road with id : ${wayId} from road with id : ${userWay}`,
    // );
    // 1- if a user exist in global locations remove it and add it again
    // 2- if a user exist in the same way remove it and add it again
    // 3- if a user exist in another way remove it and add it again
    // 4- add the current way to the user
    await this.redisService.addToSet(CHANGED_WAYS, wayId.toString());
    if (userWay) await this.redisService.addToSet(CHANGED_WAYS, userWay);
    await this.addUserToGlobalTracking(userId, geocoordinate, timestamp);
    await this.addUserToAllUsersTracking(userId, geocoordinate);
    await this.addUserToWayTracking(userId, geocoordinate, wayId);
    await this.addToMovementTracking(userId, geocoordinate, timestamp);
    await this.addWayUsers(wayId, userId);
    await this.addWaySpeeds(wayId, speed);
  }

  async newUser() {
    const id = uuidv4();
    console.log(`generated id : ${id}`);
    return { id };
  }

  private async addWayUsers(wayId: number, userId: string) {
    // remove from old set if exist
    const userWay = await this.redisService.get(
      `${USER_WAYS_TRACKING}${userId}`,
    );
    if (userWay) {
      await this.redisService.removeFromSet(`${WAY_USERS}${userWay}`, userId);
    }
    await this.redisService.addToSet(`${WAY_USERS}${wayId}`, userId);
  }

  private async addWaySpeeds(wayId: number, speed: number) {
    await this.redisService.listPush(
      `${WAY_USERS_SPEED}${wayId}`,
      speed.toString(),
    );
    const agg_key = `${AGG_WAY_USERS_SPEED}${wayId}`;
    const agg_speed_count_key = `${AGG_WAY_SPEED_COUNT}${wayId}`;
    const agg_speed = parseFloat((await this.redisService.get(agg_key)) || '0');
    const agg_count = parseInt(
      (await this.redisService.get(agg_speed_count_key)) || '0',
    );
    await this.redisService.set(agg_key, (agg_speed + speed).toString());
    await this.redisService.set(
      agg_speed_count_key,
      (agg_count + 1).toString(),
    );
  }

  private async addUserToGlobalTracking(
    userId: string,
    geocoordinate: string[],
    timestamp: number,
  ) {
    // first add it to global tracking with timestamp
    await this.redisService.geoadd(
      GLOBAL_TRACKING,
      parseFloat(geocoordinate[0]),
      parseFloat(geocoordinate[1]),
      `${userId}|${timestamp}`,
    );
  }

  private async addToMovementTracking(
    userId: string,
    geocoordinate: string[],
    timestamp: number,
  ) {
    // add the user to movement tracking
    await this.redisService.geoadd(
      `${USER_MOVEMENT_TRACKING}${userId}`,
      parseFloat(geocoordinate[0]),
      parseFloat(geocoordinate[1]),
      timestamp.toString(),
    );
  }

  private async addUserToAllUsersTracking(
    userId: string,
    geocoordinate: string[],
  ) {
    // remove if exist in all user tracking
    await this.redisService.geodel(ALL_USERS_TRACKING, userId);
    // add it to all user tracking
    await this.redisService.geoadd(
      ALL_USERS_TRACKING,
      parseFloat(geocoordinate[0]),
      parseFloat(geocoordinate[1]),
      userId,
    );
  }

  private async addUserToWayTracking(
    userId: string,
    geocoordinate: string[],
    wayId: number,
  ) {
    // get the way of the user
    const userWay = await this.redisService.get(
      `${USER_WAYS_TRACKING}${userId}`,
    );
    if (userWay) {
      // remove if exist in way tracking
      await this.redisService.geodel(`${WAY_TRACKING}${userWay}`, userId);
    }
    // add it to way tracking
    await this.redisService.geoadd(
      `${WAY_TRACKING}${wayId}`,
      parseFloat(geocoordinate[0]),
      parseFloat(geocoordinate[1]),
      userId,
    );
    // set the new way of the user
    await this.redisService.set(
      `${USER_WAYS_TRACKING}${userId}`,
      wayId.toString(),
    );
  }
}
