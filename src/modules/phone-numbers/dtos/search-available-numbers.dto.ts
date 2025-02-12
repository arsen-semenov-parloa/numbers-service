import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AvailableNumbersDTO {
  @ApiPropertyOptional({
    description: 'The phone number to search for in E.164 format',
    type: String,
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({
    description: 'The vendor to search for',
    type: String,
    example: 'twilio',
  })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({
    description: 'The region to search for',
    type: String,
    example: 'EU',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'The status of the phone number',
    type: String,
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'The customer ID associated with the phone number',
    type: String,
    example: 'customer123',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'The instance ID associated with the phone number',
    type: String,
    example: 'instance123',
  })
  @IsOptional()
  @IsString()
  instanceId?: string;
}

export class SearchAvailableNumbersDTO extends PartialType(
  AvailableNumbersDTO,
) {}
