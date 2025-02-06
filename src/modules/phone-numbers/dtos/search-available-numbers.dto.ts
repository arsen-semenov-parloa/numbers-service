import { IsOptional, IsString } from 'class-validator';

export class SearchAvailableNumbersDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
