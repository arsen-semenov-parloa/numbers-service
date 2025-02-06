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
import { SearchAvailableNumbersDTO } from './dtos/search-available-numbers.dto';
import { BuyNumbersDTO } from './dtos/buy-numbers.dto';
import { UpdateNumberDTO } from './dtos/phone-numbers.dto';
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
  async searchNumbers(@Query() query: SearchAvailableNumbersDTO) {
    this.logger.log('Searching for numbers', query);
    const result = await this.phoneNumbersService.searchNumbers(query);
    if (result.length > 0) {
      return { status: 'success', data: result };
    } else {
      throw new HttpException('No numbers found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('buy-numbers')
  @HttpCode(204)
  async buyNumbers(@Query() query: BuyNumbersDTO): Promise<void> {
    try {
      await this.phoneNumbersService.buyNumbers(query);
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
  async deleteNumber(@Query('number') number: string) {
    try {
      await this.phoneNumbersService.deleteNumber(number);
    } catch (error) {
      this.logger.error('Error deleting number', error);
      throw new HttpException(
        'Failed to delete number',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('update-number')
  @HttpCode(204)
  async updateNumber(@Body() updateNumberDTO: UpdateNumberDTO) {
    try {
      await this.phoneNumbersService.updateNumber(updateNumberDTO);
    } catch (error) {
      this.logger.error('Error updating number', error);
      throw new HttpException(
        'Failed to update number',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
