import { IsNotEmpty, IsString, Matches, IsEmail } from 'class-validator';

export class UpdateNumberDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  number!: string;

  @IsNotEmpty()
  @IsString()
  instance_id!: string;

  @IsNotEmpty()
  @IsString()
  customer_id!: string;

  @IsNotEmpty()
  @IsString()
  tenant_id!: string;

  @IsNotEmpty()
  @IsEmail()
  user_id!: string;
}
