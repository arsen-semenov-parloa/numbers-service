import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { NumberStatus } from '../schemas/phone-numbers.schema';

export class PhoneNumberDTO {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  number: string;

  @IsNotEmpty()
  @IsEnum(NumberStatus)
  status: NumberStatus;

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

export class DeletePhoneNumberDTO {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  number: string;
}

export class DeleteNumberDTO extends PartialType(DeletePhoneNumberDTO) {}
