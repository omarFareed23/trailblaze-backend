import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { ExecService } from './exec.service';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { LambdaService } from 'src/lambda/lambda.service';
import { RedisService } from 'src/redis/redis.service';
import { WAY_EXPECTED_USERS } from 'src/redis/redis.keys';

@Injectable()
export class RoutesService {
  constructor(
    // private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly execService: ExecService,
    @InjectConnection() private connection: Connection,
    private readonly lambdaService: LambdaService,
    private readonly redisService: RedisService,
  ) {}

  async getRoutes(body: any) {
    body['onDemand'] = 0;
    console.log('ROUTING BODY : ', body);
    console.log(body);
    console.log('1');
    const data = await this.lambdaService.invokeLambdaFunction('routing', body);
    console.log('2');
    // const { srcLon, srcLat, dstLon, dstLat, safetyChoice } = body;
    //     const { stdout, stderr } = await this.execService.runExecutable(
    //       './Routing',
    //       [srcLon, srcLat, dstLon, dstLat, safetyChoice, '0'],
    //     );
    //     const data = JSON.parse(stdout);
    console.log(data);
    const edges = data['edgesId'];
    if (!edges) return { path: [], expected_time: 0 };
    const result = await this.connection.query(
      `SELECT id,
           COALESCE(expected_time, length_m / (maxspeed * 5 / 18)) AS expected_time,
           length_m as length
    FROM ways
    WHERE id IN (${edges.join(',')});`,
    );
    console.log(result);
    // await this.addWayExpectedUsersToRedis(edges, result);
    // const edge_expected_time_in_order = edges.map((edge) => {
    const edge_expected_time = {};
    result.forEach((edge) => {
      edge_expected_time[edge.id] = edge.expected_time;
    });

    await this.addWayExpectedUsersToRedis(
      edges,
      edge_expected_time,
      body['userId'],
    );
    return {
      path: data['path'],
      expected_time: Math.round(
        result.reduce((acc, curr) => acc + curr.expected_time, 0) / 60,
      ),
      total_length: result.reduce((acc, curr) => acc + curr.length, 0),
      result,
    };
  }

  private async addWayExpectedUsersToRedis(
    edges: number[],
    edge_expected_time: any,
    userId: string,
  ) {
    let total_expected_time = 0;
    edges.forEach(async (edge) => {
      total_expected_time += edge_expected_time[edge];
      if (total_expected_time + Date.now() > this.getNextHour().getTime()) {
        const key = `${WAY_EXPECTED_USERS}${this.getNextHour().getTime()}${edge}`;
        await this.redisService.addToSet(key, userId);
      }
    });
  }

  private getNextHour() {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);
    return nextHour;
  }
}
