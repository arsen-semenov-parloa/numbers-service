import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuyNumbersDTO {
  @ApiPropertyOptional({
    description: 'The number of phone numbers to buy',
    type: Number,
    example: 5,
  })
  @IsOptional()
  count?: number | string;

  @ApiPropertyOptional({
    description: 'The region from which to buy phone numbers',
    type: String,
    example: 'EU',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'The vendor from which to buy phone numbers',
    type: String,
    example: 'twilio',
  })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({
    description: 'The customer ID associated with the purchase',
    type: String,
    example: 'customer123',
  })
  @IsOptional()
  @IsString()
  customerId?: string;
}

export class QueryBuyNumbersDTO extends PartialType(BuyNumbersDTO) {}
