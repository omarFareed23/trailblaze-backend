import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class RoutesService {
  constructor(
    // private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getRoutes(body: any) {
    const routeServer = this.configService.get<string>('ROUTE_SERVER');
    console.log(body);
    try {
      const response = await axios.post(routeServer, body);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
}
