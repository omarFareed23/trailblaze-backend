import { Controller } from '@nestjs/common';
import { WayDetailsService } from './way-details.service';

@Controller('way-details')
export class WayDetailsController {
  constructor(private readonly wayDetailsService: WayDetailsService) {}
}
