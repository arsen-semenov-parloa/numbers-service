// src/phone-numbers/phone-numbers.controller.ts
import {
  Controller,
  Get,
  Delete,
  Put,
  Query,
  Body,
  UseGuards,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SearchAvailableNumbersDto } from './dtos/search-available-numbers.dto';
import { BuyNumbersDto } from './dtos/buy-numbers.dto';
import { UpdateNumberDto } from './dtos/update-numbers.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PhoneNumbersService } from './phone-numbers.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PhoneNumbersController {
  private logger = new Logger(PhoneNumbersController.name);
  constructor(private readonly phoneNumbersService: PhoneNumbersService) {}

  @Get('search-available-numbers')
  @HttpCode(200)
  @Header('Content-Type', 'application/json')
  async searchNumbers(@Query() query: SearchAvailableNumbersDto) {
    this.logger.log('Searching for numbers', query);
    const result = await this.phoneNumbersService.searchNumbers(query);
    if (result.length > 0) {
      return { status: 'success', data: result };
    } else {
      throw new HttpException('No numbers found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('buy-numbers')
  buyNumbers(@Query() query: BuyNumbersDto) {
    return this.phoneNumbersService.buyNumbers(query);
  }

  @Delete('delete-number')
  deleteNumber(@Query('number') number: string) {
    return this.phoneNumbersService.deleteNumber(number);
  }

  @Put('update-number')
  updateNumber(@Body() updateNumberDto: UpdateNumberDto) {
    // Dummy implementation – replace with your logic.
    return {
      status: 'updated',
      updated: updateNumberDto,
    };
  }
}
