import { IsOptional, IsInt, IsString } from 'class-validator';

export class BuyNumbersDto {
  @IsOptional()
  @IsInt()
  count?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  vendor?: string;
}
