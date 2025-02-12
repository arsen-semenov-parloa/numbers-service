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
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SearchAvailableNumbersDTO } from './dtos/search-available-numbers.dto';
import { BuyNumbersDTO } from './dtos/buy-numbers.dto';
import { DeleteNumberDTO, UpdateNumberDTO } from './dtos/phone-numbers.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PhoneNumbersService } from './phone-numbers.service';
import { HttpExceptionsFilter } from '../filters/http-exceptions.filter';

@ApiTags('phone-numbers')
@Controller('phone-numbers')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionsFilter)
export class PhoneNumbersController {
  private logger = new Logger(PhoneNumbersController.name);
  constructor(private readonly phoneNumbersService: PhoneNumbersService) {}

  @Get('search-available-numbers')
  @HttpCode(200)
  @ApiOperation({ summary: 'Search available phone numbers' })
  @ApiQuery({ name: 'number', required: false, type: String })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'vendor', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Numbers found',
    schema: { example: { statusCode: 200, status: 'success', data: [] } },
  })
  @ApiResponse({ status: 404, description: 'No numbers found' })
  async searchNumbers(@Query() query: SearchAvailableNumbersDTO) {
    this.logger.debug('Searching for numbers', query);
    const result = await this.phoneNumbersService.searchNumbers(query);
    if (result.length > 0) {
      return { statusCode: HttpStatus.OK, status: 'success', data: result };
    } else {
      throw new HttpException('No numbers found', HttpStatus.NOT_FOUND);
    }
  }

  @Post('buy-numbers')
  @HttpCode(200)
  @ApiOperation({ summary: 'Buy phone numbers' })
  @ApiBody({ type: BuyNumbersDTO })
  @ApiResponse({ status: 200, description: 'Numbers bought successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async buyNumbers(@Body() query: BuyNumbersDTO) {
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
  @ApiOperation({ summary: 'Delete a phone number' })
  @ApiQuery({ name: 'number', required: true, type: String })
  @ApiResponse({ status: 204, description: 'Number deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteNumber(@Query() query: DeleteNumberDTO) {
    await this.phoneNumbersService.deleteNumber(query);
  }

  @Put('update-number')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a phone number' })
  @ApiBody({ type: UpdateNumberDTO })
  @ApiResponse({ status: 200, description: 'Number updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateNumber(@Body() updateNumberDTO: UpdateNumberDTO) {
    return await this.phoneNumbersService.updateNumber(updateNumberDTO);
  }
}
