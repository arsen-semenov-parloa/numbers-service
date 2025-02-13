import { Test, TestingModule } from '@nestjs/testing';
import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { HttpExceptionsFilter } from '../filters/http-exceptions.filter';

describe('PhoneNumbersController', () => {
  let controller: PhoneNumbersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneNumbersController],
      providers: [
        {
          provide: PhoneNumbersService,
          useValue: {
            searchNumbers: jest.fn(),
            buyNumbers: jest.fn(),
            deleteNumber: jest.fn(),
            updateNumber: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: HttpExceptionsFilter,
          useValue: {
            catch: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PhoneNumbersController>(PhoneNumbersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
