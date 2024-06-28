import { Test, TestingModule } from '@nestjs/testing';
import { WayDetailsController } from './way-details.controller';
import { WayDetailsService } from './way-details.service';

describe('WayDetailsController', () => {
  let controller: WayDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WayDetailsController],
      providers: [WayDetailsService],
    }).compile();

    controller = module.get<WayDetailsController>(WayDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
