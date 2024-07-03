import { Body, Controller, Post } from '@nestjs/common';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  getRoutes(@Body() body: any) {
    return this.routesService.getRoutes(body);
  }
}
