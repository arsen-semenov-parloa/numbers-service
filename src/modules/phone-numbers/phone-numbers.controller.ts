// src/phone-numbers/phone-numbers.controller.ts
import {
  Controller,
  Get,
  Delete,
  Put,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { SearchAvailableNumbersDTO } from './dtos/search-available-numbers.dto';
import { BuyNumbersDTO } from './dtos/buy-numbers.dto';
import { DeleteNumberDTO, UpdateNumberDTO } from './dtos/phone-numbers.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PhoneNumbersService } from './phone-numbers.service';
import { HttpExceptionsFilter } from '../filters/http-exceptions.filter';

@Controller()
@UseGuards(JwtAuthGuard)
export class PhoneNumbersController {
  private logger = new Logger(PhoneNumbersController.name);
  constructor(private readonly phoneNumbersService: PhoneNumbersService) {}

  @Get('search-available-numbers')
  @HttpCode(200)
  async searchNumbers(@Query() query: SearchAvailableNumbersDTO) {
    this.logger.debug('Searching for numbers', query);
    const result = await this.phoneNumbersService.searchNumbers(query);
    if (result.length > 0) {
      return { statusCode: HttpStatus.OK, status: 'success', data: result };
    } else {
      throw new HttpException('No numbers found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('buy-numbers')
  @HttpCode(200)
  async buyNumbers(@Query() query: BuyNumbersDTO) {
    try {
      const result = await this.phoneNumbersService.buyNumbers(query);
      this.logger.log('Bought numbers', result);
      return { statusCode: HttpStatus.OK, status: 'success', data: result };
    } catch (error) {
      this.logger.error('Error buying numbers', error);
      throw new HttpException(
        'Failed to buy numbers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete-number')
  @HttpCode(204)
  async deleteNumber(@Query() query: DeleteNumberDTO) {
    await this.phoneNumbersService.deleteNumber(query);
  }

  @Put('update-number')
  @HttpCode(204)
  @UseFilters(new HttpExceptionsFilter())
  async updateNumber(@Body() updateNumberDTO: UpdateNumberDTO) {
    await this.phoneNumbersService.updateNumber(updateNumberDTO);
  }
}
