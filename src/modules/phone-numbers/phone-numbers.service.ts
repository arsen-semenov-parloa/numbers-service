import { Injectable, Logger } from '@nestjs/common';
import { PhoneVendorsFactory } from '../phone-vendors/phone-vendors.factory';
import { SearchAvailableNumbersDTO } from './dtos/search-available-numbers.dto';
import { BuyNumbersDTO } from './dtos/buy-numbers.dto';
import { UpdateNumberDTO } from './dtos/phone-numbers.dto';
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

  // TODO: createdBy
  async buyNumbers({ count, region, vendor }: BuyNumbersDTO): Promise<number> {
    const purchasedFromVendor = vendor ? vendor.toLowerCase() : 'twilio';
    const countToBuy = count ? parseInt(count as string, 10) : 5;
    const regionToBuy = region ? region : 'EU';

    const vendorInstance = this.phoneVendorsFactory.get(purchasedFromVendor);
    if (vendorInstance) {
      this.logger.log(
        `Going to buy ${countToBuy} phone numbers from ${purchasedFromVendor}`,
      );
      try {
        const numbers = await vendorInstance.buyNumbers(
          countToBuy,
          regionToBuy,
        );
        this.logger.log(
          `Bought ${numbers.length} phone numbers from ${purchasedFromVendor}, numbers: ${numbers}`,
        );
        await this.storeNumbers(numbers, regionToBuy, purchasedFromVendor);
        return numbers.length;
      } catch (error) {
        this.logger.error('Error buying numbers', error);
        return 0;
      }
    } else {
      this.logger.error(`Vendor ${purchasedFromVendor} not found`);
      return 0;
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

    try {
      const result = await this.phoneNumberModel.insertMany(phoneNumbers);
      this.logger.log(`Stored phone numbers: ${result}`);
    } catch (error) {
      this.logger.error('Error storing phone numbers', error);
      throw new Error('Failed to store phone numbers');
    }
  }

  async searchNumbers(
    query: SearchAvailableNumbersDTO,
  ): Promise<PhoneNumber[]> {
    const { number, region, vendor } = query;
    this.logger.log(
      `Searching for number: ${number}, region: ${region}, vendor: ${vendor}`,
    );

    const searchCriteria: any = {};
    if (number) searchCriteria.number = number;
    if (region) searchCriteria.region = region;
    if (vendor) searchCriteria.vendor = vendor;

    return this.phoneNumberModel.find(searchCriteria).exec();
  }

  async deleteNumber(number: string): Promise<void> {
    try {
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
    } catch (error) {
      this.logger.error('Error deleting number', error);
      throw new Error('Failed to delete number');
    }
  }

  async updateNumber(updateNumberDto: UpdateNumberDTO): Promise<void> {
    const { number, status, instance_id, customer_id, tenant_id } =
      updateNumberDto;
    try {
      await this.phoneNumberModel
        .updateOne(
          { number },
          {
            $set: {
              status,
              instance_id,
              customer_id,
              tenant_id,
            },
          },
        )
        .exec();
    } catch (error) {
      this.logger.error('Error updating number', error);
      throw new Error('Failed to update number');
    }
  }
}
