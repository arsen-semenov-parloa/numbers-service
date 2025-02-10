import { Injectable, Logger } from '@nestjs/common';
import { PhoneVendorService } from '../phone-vendors.interface';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import { CustomClientService } from './custom-client';

@Injectable()
export class TwilioVendorService implements PhoneVendorService {
  private readonly logger = new Logger(TwilioVendorService.name);
  private readonly client: any;
  private readonly clientTrunking: any;
  private readonly env: string;
  twilioAccountSid: string;
  twillioAuthToken: string;
  twilioDEAddressSid: string;
  twilioDEBundleSid: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    this.twillioAuthToken =
      this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.twilioDEBundleSid =
      this.configService.get<string>('TWILIO_DE_BUNDLE_SID') || '';
    this.twilioDEAddressSid =
      this.configService.get<string>('TWILIO_DE_ADDRESS_SID') || '';
    this.env = this.configService.get<string>('NODE_ENV') || 'development';

    if (this.env === 'production') {
      this.client = Twilio(this.twilioAccountSid, this.twillioAuthToken);
    } else {
      this.client = Twilio(this.twilioAccountSid, this.twillioAuthToken, {
        httpClient: new CustomClientService(
          60000,
          this.configService.get<string>('TWILIO_MOCK_URL') ||
            'http://prism:4010',
          this.twilioAccountSid,
          this.twillioAuthToken,
        ),
        logLevel: 'debug',
      });
      this.clientTrunking = Twilio(
        this.twilioAccountSid,
        this.twillioAuthToken,
        {
          httpClient: new CustomClientService(
            60000,
            this.configService.get<string>('TWILIO_MOCK_TRUNKING_URL') ||
              'http://prism2:4010',
            this.twilioAccountSid,
            this.twillioAuthToken,
          ),
        },
      );
    }
  }

  async buyNumbers(
    count: number,
    region: string,
    customer: string,
  ): Promise<any[]> {
    this.logger.log(
      'Using Twilio API Mock',
      this.twilioAccountSid,
      this.twillioAuthToken,
    );

    const areaName = region === 'DE' ? 'Berlin' : region === 'US' ? 'NY' : ''; // TODO: refactor
    this.logger.log('Buying phone numbers from Twilio', count, areaName);

    const purchasedNumbers = [];

    const trunkSID = await this.createTrunk(customer);
    try {
      await this.createOriginationUrl(trunkSID, customer);
    } catch (error) {
      this.logger.error('Error creating origination URL:', error);
      throw new Error('Error creating origination URL');
    }

    try {
      for (let i = 0; i < count; i++) {
        const availableNumbers = await this.getAvailableNumbers(
          region,
          areaName,
        );
        purchasedNumbers.push(availableNumbers[0].phoneNumber);
        await this.createPhoneNumberAddToTrunk(
          availableNumbers[0].phoneNumber,
          trunkSID,
          region,
          customer,
        );
      }

      this.logger.log(
        `Bought ${count} phone numbers from Twilio for ${region} and ${customer}`,
      );
      return Promise.resolve(purchasedNumbers);
    } catch (error) {
      this.logger.error('Error buying phone numbers from Twilio', error);
      throw new Error('Error buying phone numbers from Twilio');
    }
  }

  private async getAvailableNumbers(
    region: string,
    areaName: string,
  ): Promise<any[]> {
    const availableNumbers = await this.client
      .availablePhoneNumbers(region)
      .local.list({ limit: 1, areaCode: areaName });

    if (!availableNumbers || availableNumbers.length === 0) {
      this.logger.error('No phone numbers available');
      throw new Error('No phone numbers available');
    }

    this.logger.log(
      'Available phone numbers',
      JSON.stringify(availableNumbers[0]),
    );

    return availableNumbers;
  }

  private async createTrunk(name: string): Promise<string> {
    if (!name) {
      throw new Error('Customer name is required');
    }
    let trunk: any;
    try {
      if (this.env === 'development') {
        trunk = await this.clientTrunking.trunking.v1.trunks.create({
          friendlyName: name,
          secure: true,
          transferEnabled: true,
          transferMode: 'enable-all',
        });
      } else {
        trunk = await this.client.trunking.v1.trunks.create({
          friendlyName: name,
          secure: true,
          transferEnabled: true,
          transferMode: 'enable-all',
        });
      }

      this.logger.log(`Trunk created with SID: ${trunk.sid}`);

      await this.createOriginationUrl(trunk.sid, name);
      return trunk.sid;
    } catch (error) {
      this.logger.error('Error creating trunk:', error);
      throw new Error('Error creating trunk');
    }
  }

  private async createOriginationUrl(
    trunkSid: string,
    name: string,
  ): Promise<string> {
    if (!name) {
      throw new Error('Customer name is required');
    }
    const originationUri = `sip:${name}.voip.parloa.com`;
    let originationUrl: any;
    try {
      if (this.env === 'development') {
        originationUrl = await this.clientTrunking.trunking.v1
          .trunks(trunkSid)
          .originationUrls.create({
            enabled: true,
            friendlyName: name,
            priority: 10,
            sipUrl: originationUri,
            weight: 10,
          });
      } else {
        originationUrl = await this.client.trunking.v1
          .trunks(trunkSid)
          .originationUrls.create({
            enabled: true,
            friendlyName: name,
            priority: 10,
            sipUrl: originationUri,
            weight: 10,
          });
      }

      this.logger.log(
        `Origination URL created with SID: ${originationUrl.sid}`,
      );

      return originationUrl.sid;
    } catch (error) {
      this.logger.error('Error creating origination URL:', error);
      throw new Error('Error creating origination URL');
    }
  }

  private async createPhoneNumberAddToTrunk(
    number: string,
    trunkSid: string,
    region: string,
    customer: string,
  ): Promise<void> {
    let purchasedNumber;
    try {
      if (region === 'DE') {
        purchasedNumber = await this.client.incomingPhoneNumbers.create({
          addressSid: this.twilioDEAddressSid,
          bundleSid: this.twilioDEBundleSid,
          phoneNumber: number,
          friendlyName: customer,
        });
      } else if (region === 'US') {
        purchasedNumber = await this.client.incomingPhoneNumbers.create({
          number,
          friendlyName: customer,
        });
      }

      if (purchasedNumber) {
        if (this.env === 'development') {
          await this.clientTrunking.trunking.v1
            .trunks(trunkSid)
            .phoneNumbers.create({ phoneNumberSid: purchasedNumber.sid });
        } else {
          await this.client.trunking.v1
            .trunks(trunkSid)
            .phoneNumbers.create({ phoneNumberSid: purchasedNumber.sid });
        }
      }
    } catch (error) {
      this.logger.error('Error adding purchased number to trunk:', error);
      throw new Error('Error adding purchased number to trunk');
    }
  }
}
