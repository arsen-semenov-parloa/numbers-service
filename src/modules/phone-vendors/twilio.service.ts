import { Injectable, Logger } from '@nestjs/common';
import { PhoneVendorService } from './phone-vendors.interface';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioVendorService implements PhoneVendorService {
  private readonly logger = new Logger(TwilioVendorService.name);
  private readonly client: any;
  twilioAccountSid: string;
  twillioAuthToken: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioAccountSid =
      this.configService.get<string>('TWILLIO_ACCOUNT_SID') || '';
    this.twillioAuthToken =
      this.configService.get<string>('TWILLIO_ACCOUNT_TOKEN') || '';
    this.client = Twilio(this.twilioAccountSid, this.twillioAuthToken);
  }

  async buyNumbers(count: number, region: string): Promise<any[]> {
    try {
      const availableNumbers = await this.client
        .availablePhoneNumbers(region)
        .local.list({ limit: count });

      if (!availableNumbers || availableNumbers.length === 0) {
        this.logger.error('No phone numbers available');
        return Promise.resolve([]);
      }

      const purchasedNumbers = [];
      for (const number of availableNumbers) {
        const purchasedNumber = await this.client.incomingPhoneNumbers.create({
          phoneNumber: number.phoneNumber,
        });
        purchasedNumbers.push(purchasedNumber);
      }

      this.logger.log('Buying phone numbers from Twilio', count);
      return Promise.resolve(purchasedNumbers);
    } catch (error) {
      this.logger.error('Error buying phone numbers from Twilio', error);
      return Promise.resolve([]);
    }
  }
}
