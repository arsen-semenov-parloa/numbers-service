import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

export class AvailableNumbersDTO {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  instanceId?: string;
}

export class SearchAvailableNumbersDTO extends PartialType(
  AvailableNumbersDTO,
) {}
