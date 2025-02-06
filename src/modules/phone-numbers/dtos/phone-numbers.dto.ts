import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';

export class PhoneNumberDTO {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  number?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  instance_id?: string;

  @IsString()
  customer_id?: string;

  @IsString()
  tenant_id?: string;

  @IsString()
  createdBy?: string; // userID
}

export class UpdateNumberDTO extends PartialType(PhoneNumberDTO) {}
