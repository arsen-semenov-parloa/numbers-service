import { Test, TestingModule } from '@nestjs/testing';
import { PhoneNumbersService } from './phone-numbers.service';
import { PhoneVendorsFactory } from '../phone-vendors/phone-vendors.factory';
import { getModelToken } from '@nestjs/mongoose';
import { PhoneNumber } from './schemas/phone-numbers.schema';
import { Customers } from './schemas/customers.schema';

describe('PhoneNumbersService', () => {
  let service: PhoneNumbersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhoneNumbersService,
        {
          provide: PhoneVendorsFactory,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken(PhoneNumber.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn(),
            insertMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(Customers.name),
          useValue: {
            // Mock the methods used in the service
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PhoneNumbersService>(PhoneNumbersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
