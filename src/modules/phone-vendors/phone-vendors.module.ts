import { Module } from '@nestjs/common';
import { PhoneVendorsFactory } from './phone-vendors.factory';
import { TwilioVendorService } from './twilio.service';

@Module({
  imports: [],
  providers: [PhoneVendorsFactory, TwilioVendorService],
  exports: [PhoneVendorsFactory, TwilioVendorService],
})
export class PhoneVendorsModule {}
