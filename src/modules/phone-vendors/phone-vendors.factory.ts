import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TwilioVendorService } from './twilio/twilio.service';
import { error } from 'console';

@Injectable()
export class PhoneVendorsFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  get(vendor: string) {
    switch (vendor) {
      case 'twilio':
        return this.moduleRef.get(TwilioVendorService);
      default:
        return error(`Vendor ${vendor} not found`);
    }
  }
}
