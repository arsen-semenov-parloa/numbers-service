import { Injectable, Logger } from '@nestjs/common';
import { PhoneVendorService } from '../phone-vendors.interface';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import { CustomClientService } from './custom-client';

@Injectable()
export class TwilioVendorService implements PhoneVendorService {
  private readonly logger = new Logger(TwilioVendorService.name);
  private readonly client: any;
  twilioAccountSid: string;
  twillioAuthToken: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    this.twillioAuthToken =
      this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';

    if (this.configService.get<string>('NODE_ENV') === 'production') {
      this.client = Twilio(this.twilioAccountSid, this.twillioAuthToken);
    } else {
      this.client = Twilio(this.twilioAccountSid, this.twillioAuthToken, {
        httpClient: new CustomClientService(
          60000,
          'http://172.18.0.3:4010',
          this.twilioAccountSid,
          this.twillioAuthToken,
        ),
      });
    }
  }

  async buyNumbers(count: number, region: string): Promise<any[]> {
    this.logger.log(
      'Using Twilio API Mock',
      this.twilioAccountSid,
      this.twillioAuthToken,
    );

    const areaName = region === 'DE' ? 'Berlin' : region === 'US' ? 'NY' : '';
    this.logger.log('Buying phone numbers from Twilio', count, areaName);

    const purchasedNumbers = [];

    try {
      for (let i = 0; i < count; i++) {
        const availableNumbers = await this.client
          .availablePhoneNumbers(region)
          .local.list({ limit: 1, areaCode: areaName });

        if (!availableNumbers || availableNumbers.length === 0) {
          this.logger.error('No phone numbers available');
          return Promise.resolve([]);
        }

        this.logger.log(
          'Available phone numbers',
          JSON.stringify(availableNumbers[0]),
        );

        purchasedNumbers.push(availableNumbers[0].phoneNumber);
      }

      // FIXME: Uncomment this block to buy numbers from Twilio
      /*
      for (const number of availableNumbers) {
        const purchasedNumber = await this.client.incomingPhoneNumbers.create({
          phoneNumber: number.phoneNumber,
        });
        purchasedNumbers.push(purchasedNumber);
      }
        */

      this.logger.log('Buying phone numbers from Twilio', count);
      return Promise.resolve(purchasedNumbers);
    } catch (error) {
      this.logger.error('Error buying phone numbers from Twilio', error);
      return Promise.resolve([]);
    }
  }
}
