import { Test, TestingModule } from '@nestjs/testing';
import { TwilioVendorService } from './twilio.service';

describe('TwilioVendorService', () => {
  let service: TwilioVendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwilioVendorService],
    }).compile();

    service = module.get<TwilioVendorService>(TwilioVendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
