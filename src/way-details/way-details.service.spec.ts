import { Test, TestingModule } from '@nestjs/testing';
import { WayDetailsService } from './way-details.service';

describe('WayDetailsService', () => {
  let service: WayDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WayDetailsService],
    }).compile();

    service = module.get<WayDetailsService>(WayDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
