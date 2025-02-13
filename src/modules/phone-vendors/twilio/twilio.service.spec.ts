import { Test, TestingModule } from '@nestjs/testing';
import { TwilioVendorService } from './twilio.service';
import { CustomClientService } from './custom-client';
import { ConfigService } from '@nestjs/config';

describe('TwilioVendorService', () => {
  let service: TwilioVendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioVendorService,
        {
          provide: CustomClientService,
          useValue: {
            request: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TwilioVendorService>(TwilioVendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
