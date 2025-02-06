import { Injectable, Logger } from '@nestjs/common';
import { PhoneVendorsFactory } from '../phone-vendors/phone-vendors.factory';
import { SearchAvailableNumbersDto } from './dtos/search-available-numbers.dto';
import { BuyNumbersDto } from './dtos/buy-numbers.dto';
import { PhoneNumber } from './schemas/phone-numbers.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PhoneNumbersService {
  private readonly logger = new Logger(PhoneNumbersService.name);
  constructor(
    private readonly phoneVendorsFactory: PhoneVendorsFactory,
    @InjectModel(PhoneNumber.name)
    private phoneNumberModel: Model<PhoneNumber>,
  ) {}

  async buyNumbers({ count, region, vendor }: BuyNumbersDto): Promise<void> {
    const purchasedFromVendor = vendor ? vendor.toLowerCase() : 'twilio';
    const countToBuy = count ? count : 5;
    const regionToBuy = region ? region : 'EU';

    const vendorInstance = this.phoneVendorsFactory.get(purchasedFromVendor);
    if (vendorInstance) {
      this.logger.log(
        `Going to buy ${count} phone numbers from ${purchasedFromVendor}`,
      );
      const numbers = await vendorInstance.buyNumbers(countToBuy, regionToBuy);
      this.logger.log(
        `Bought ${count} phone numbers from ${purchasedFromVendor}, numbers: ${numbers}`,
      );
      this.storeNumbers(numbers, regionToBuy, purchasedFromVendor);
    } else {
      throw new Error(`Vendor ${purchasedFromVendor} not found`);
    }
  }

  async storeNumbers(
    numbers: string[],
    regionFrom: string,
    purchaseFrom: string,
  ): Promise<void> {
    const phoneNumbers = numbers.map((number) => ({
      number,
      region: regionFrom,
      vendor: purchaseFrom,
      status: 'new',
      instanceId: '',
      customerId: '',
      tenantId: '',
    }));

    await this.phoneNumberModel.insertMany(phoneNumbers);
  }

  async searchNumbers(
    query: SearchAvailableNumbersDto,
  ): Promise<PhoneNumber[]> {
    const { number, region, vendor } = query;
    this.logger.log(
      `Searching for number: ${number}, region: ${region}, vendor: ${vendor}`,
    );
    return this.phoneNumberModel.find({ number, region, vendor }).exec();
  }

  async deleteNumber(number: string): Promise<void> {
    await this.phoneNumberModel
      .updateOne(
        { number },
        {
          $set: {
            status: 'deleted',
            instanceId: '',
            customerId: '',
            tenantId: '',
          },
        },
      )
      .exec();
  }
}
