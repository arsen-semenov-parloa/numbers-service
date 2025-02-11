import { Injectable, Logger } from '@nestjs/common';
import { PhoneVendorsFactory } from '../phone-vendors/phone-vendors.factory';
import { SearchAvailableNumbersDTO } from './dtos/search-available-numbers.dto';
import { BuyNumbersDTO } from './dtos/buy-numbers.dto';
import { UpdateNumberDTO } from './dtos/phone-numbers.dto';
import { PhoneNumber } from './schemas/phone-numbers.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Customers } from './schemas/customers.schema';

@Injectable()
export class PhoneNumbersService {
  private readonly logger = new Logger(PhoneNumbersService.name);
  constructor(
    private readonly phoneVendorsFactory: PhoneVendorsFactory,
    @InjectModel(PhoneNumber.name)
    private phoneNumberModel: Model<PhoneNumber>,
    @InjectModel(Customers.name)
    private readonly customersModel: Model<Customers>,
  ) {}

  // TODO: add createdBy
  async buyNumbers({
    count,
    region,
    vendor,
    customerId,
  }: BuyNumbersDTO): Promise<number> {
    const purchasedFromVendor = vendor ? vendor.toLowerCase() : 'twilio';
    const countToBuy = count ? parseInt(count as string, 10) : 1;
    const regionToBuy = region ? region : 'EU';

    let customerOID: string;

    if (customerId) {
      try {
        customerOID = await this.getCustomerOID(customerId);
        this.logger.log(`Customer ID ${customerId} found, OID: ${customerOID}`);
      } catch (error) {
        this.logger.error(error);
        throw new Error('Failed to find customer'); // TODO: proper error handling
      }
    } else {
      this.logger.log('Customer not provided');
      throw new Error('Customer ID is required');
    }

    const vendorInstance = this.phoneVendorsFactory.get(purchasedFromVendor);
    if (vendorInstance) {
      this.logger.log(
        `Going to buy ${countToBuy} phone numbers from ${purchasedFromVendor}`,
      );
      try {
        const numbers = await vendorInstance.buyNumbers(
          countToBuy,
          regionToBuy,
          customerId,
        );
        this.logger.log(
          `Bought ${numbers.length} phone numbers from ${purchasedFromVendor}, numbers: ${numbers}, customer_id: ${customerId}`,
        );

        await this.storeNumbers(
          numbers,
          regionToBuy,
          purchasedFromVendor,
          customerOID,
        );
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

  private async getCustomerOID(customerId: string): Promise<string> {
    const customer = await this.customersModel.findOne({ customerId }).exec();
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    return customer._id.toString();
  }

  private async storeNumbers(
    numbers: string[],
    regionFrom: string,
    purchaseFrom: string,
    customerId?: string,
  ): Promise<void> {
    const phoneNumbers = numbers.map((number) => ({
      number,
      region: regionFrom,
      vendor: purchaseFrom,
      status: 'new',
      instanceId: '',
      customerId: new Types.ObjectId(customerId) || '',
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
