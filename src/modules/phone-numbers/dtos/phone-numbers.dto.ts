import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NumberStatus } from '../schemas/phone-numbers.schema';

export class PhoneNumberDTO {
  @ApiProperty({
    description: 'The phone number in E.164 format',
    type: String,
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  number: string;

  @ApiProperty({
    description: 'The status of the phone number',
    enum: NumberStatus,
    example: NumberStatus.ACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(NumberStatus)
  status: NumberStatus;

  @ApiPropertyOptional({
    description: 'The instance ID associated with the phone number',
    type: String,
    example: 'instance123',
  })
  @IsString()
  instance_id?: string;

  @ApiPropertyOptional({
    description: 'The customer ID associated with the phone number',
    type: String,
    example: 'customer123',
  })
  @IsString()
  customer_id?: string;

  @ApiPropertyOptional({
    description: 'The tenant ID associated with the phone number',
    type: String,
    example: 'tenant123',
  })
  @IsString()
  tenant_id?: string;

  @ApiPropertyOptional({
    description: 'The user ID who created the phone number',
    type: String,
    example: 'user123',
  })
  @IsString()
  createdBy?: string; // userID
}

export class UpdateNumberDTO extends PartialType(PhoneNumberDTO) {}

export class DeletePhoneNumberDTO {
  @ApiProperty({
    description: 'The phone number to delete in E.164 format',
    type: String,
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  number: string;
}

export class DeleteNumberDTO extends PartialType(DeletePhoneNumberDTO) {}
