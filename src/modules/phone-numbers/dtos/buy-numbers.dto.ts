import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

export class BuyNumbersDTO {
  @IsOptional()
  count?: number | string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  vendor?: string;
}

export class QueryBuyNumbersDTO extends PartialType(BuyNumbersDTO) {}
