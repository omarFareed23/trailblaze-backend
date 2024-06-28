import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { TrackUserDto } from './dtos/track-user.dto';
import { RedisService } from 'src/redis/redis.service';
import {
  ALL_USERS_TRACKING,
  GLOBAL_TRACKING,
  USER_MOVEMENT_TRACKING,
  USER_WAYS_TRACKING,
  WAY_TRACKING,
} from 'src/redis/redis.constants';
import { UUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly redisService: RedisService) {}

  async trackUser(trackUserDto: TrackUserDto) {
    const {
      'user-id': userId,
      geocoordinate,
      timestamp,
      'way-id': wayId,
    } = trackUserDto;
    await this.redisService.geoadd(
      'all-users-locations',
      parseFloat(geocoordinate[0]),
      parseFloat(geocoordinate[1]),
      userId,
    );
    // 1- if a user exist in global locations remove it and add it again
    // 2- if a user exist in the same way remove it and add it again
    // 3- if a user exist in another way remove it and add it again
    // 4- add the current way to the user

    await this.addUserToGlobalTracking(userId, geocoordinate, timestamp);
    await this.addUserToAllUsersTracking(userId, geocoordinate);
    await this.addUserToWayTracking(userId, geocoordinate, wayId);
    await this.addToMovementTracking(userId, geocoordinate, timestamp);
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
