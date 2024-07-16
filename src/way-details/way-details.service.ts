import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  AGG_WAY_SPEED_COUNT,
  AGG_WAY_USERS_SPEED,
  CHANGED_WAYS,
  WAY_EXPECTED_USERS,
  WAY_USERS,
} from 'src/redis/redis.keys';
import { RedisService } from 'src/redis/redis.service';
import { WayDetails } from './way-details.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
// import { WayDetailsRepository } from './way-details.repository';

@Injectable()
export class WayDetailsService {
  constructor(
    private readonly redisService: RedisService,
    // private readonly wayDetailsRepository: WayDetailsRepository,
    @InjectRepository(WayDetails)
    private wayDetailsRepository: Repository<WayDetails>,
  ) {}
  @Cron('30 * * * *')
  async addWaysDetailsToDB() {
    const timestamp = this.getStartOfHour();
    // console.log('WAY IDS: ', wayIds);
    const wayIds = await this.redisService.getSetMembers(CHANGED_WAYS);
    console.log(`WAY IDs : ${wayIds}`);
    await Promise.all(
      wayIds.map(async (wayId: string) => {
        // console.log(wayId);
        let wayDetails = await this.wayDetailsRepository.findOneBy({
          way_id: wayId,
          timestamp,
        });
        // console.log('1')
        if (!wayDetails) {
          wayDetails = new WayDetails();
          wayDetails.way_id = wayId;
          wayDetails.timestamp = timestamp;
        }
        // console.log(`${WAY_USERS}${wayId}`)
        const numOfUsers = await this.redisService.getSetL(
          `${WAY_USERS}${wayId}`,
        );
        // console.log('3')
        const sumSpeed = parseFloat(
          await this.redisService.get(`${AGG_WAY_USERS_SPEED}${wayId}`),
        );
        // console.log('4')
        const speedCount = parseInt(
          await this.redisService.get(`${AGG_WAY_SPEED_COUNT}${wayId}`),
        );

        const expectedNumOfUsers = await this.redisService.getSetL(
          `${WAY_EXPECTED_USERS}${this.getStartOfHour()}${wayId}`,
        );
        console.log(`${WAY_EXPECTED_USERS}${this.getStartOfHour()}${wayId}`);
        // console.log('5')
        wayDetails.num_of_cars = numOfUsers;
        wayDetails.avgSpeed = sumSpeed / speedCount;
        wayDetails.expected_num_of_cars = expectedNumOfUsers;
        console.log('WAY DETAILS : ', wayDetails);
        // console.log(wayDetails.num_of_cars, timestamp);
        await this.wayDetailsRepository.save(wayDetails);
      }),
    );
    // console.log
    await axios.post(`${process.env.FLASK_SERVER}/predict`, {
      timestamp,
    });
    await this.redisService.del(CHANGED_WAYS);
  }

  private getStartOfHour() {
    const now = new Date();
    const startOfHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0,
      0,
    );
    return startOfHour.getTime();
  }

  async updateExpectedTime() {}
}
