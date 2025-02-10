import { Module } from '@nestjs/common';
import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';
import { PhoneVendorsModule } from '../phone-vendors/phone-vendors.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PhoneNumber, PhoneNumberSchema } from './schemas/phone-numbers.schema';
import { Customers, CustomersSchema } from './schemas/customers.schema';
import { PhoneVendorsFactory } from '../phone-vendors/phone-vendors.factory';
import { TwilioVendorService } from '../phone-vendors/twilio/twilio.service';

@Module({
  controllers: [PhoneNumbersController],
  providers: [PhoneNumbersService, PhoneVendorsFactory, TwilioVendorService],
  imports: [
    MongooseModule.forFeature([
      { name: PhoneNumber.name, schema: PhoneNumberSchema },
    ]),
    MongooseModule.forFeature([
      { name: Customers.name, schema: CustomersSchema },
    ]),
    PhoneVendorsModule,
  ],
  exports: [MongooseModule, PhoneNumbersService],
})
export class PhoneNumbersModule {}
