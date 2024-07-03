import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  AGG_WAY_SPEED_COUNT,
  AGG_WAY_USERS_SPEED,
  WAY_USERS,
} from 'src/redis/redis.keys';
import { RedisService } from 'src/redis/redis.service';
import { WayDetails } from './way-details.entity';
import { Repository } from 'typeorm';
import { WayDetailsRepository } from './way-details.repository';

@Injectable()
export class WayDetailsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly wayDetailsRepository: WayDetailsRepository,
  ) {}
  @Cron('30 * * * *')
  async addWaysDetailsToDB() {
    const wayUserKeys = await this.redisService.getKeys(`${WAY_USERS}*`);
    const wayIds = wayUserKeys.map((wayKey) => wayKey.split(':')[1]);
    const timeStamp = this.getStartOfHour();
    wayIds.forEach(async (wayId: string) => {
      const waysDetails = await this.wayDetailsRepository.findOneOrCreate(
        wayId,
        timeStamp,
      );
      const numOfUsers = await this.redisService.getSetL(
        `${WAY_USERS}${wayId}`,
      );
      const sumSpeed = parseFloat(
        await this.redisService.get(`${AGG_WAY_USERS_SPEED}${wayId}`),
      );
      const speedCount = parseInt(
        await this.redisService.get(`${AGG_WAY_SPEED_COUNT}${wayId}`),
      );
      waysDetails.numberOfUsers = numOfUsers;
      waysDetails.avgSpeed = sumSpeed / speedCount;
      await this.wayDetailsRepository.save(waysDetails);
    });
  }

  private getStartOfHour() {
    const now = new Date();
    const startOfHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0,
    );
    return startOfHour.getTime();
  }
}
