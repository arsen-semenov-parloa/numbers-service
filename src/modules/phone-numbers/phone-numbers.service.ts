import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PhoneVendorsFactory } from '../phone-vendors/phone-vendors.factory';
import { SearchAvailableNumbersDTO } from './dtos/search-available-numbers.dto';
import { BuyNumbersDTO } from './dtos/buy-numbers.dto';
import { DeleteNumberDTO, UpdateNumberDTO } from './dtos/phone-numbers.dto';
import { PhoneNumber, NumberStatus } from './schemas/phone-numbers.schema';
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
  }: BuyNumbersDTO): Promise<any[]> {
    const purchasedFromVendor = vendor ? vendor.toLowerCase() : 'twilio';
    const countToBuy = count ? parseInt(count as string, 10) : 1;
    const regionToBuy = region ? region : 'EU';

    let customerOID: string;

    if (customerId) {
      try {
        customerOID = await this.getCustomerOID(customerId);
        this.logger.debug(
          `Customer ID ${customerId} found, OID: ${customerOID}`,
        );
      } catch (error) {
        this.logger.error(error);
        throw new BadRequestException('Customer not found');
      }
    } else {
      this.logger.log('Customer not provided');
      throw new BadRequestException('Customer ID is required');
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
        return numbers;
      } catch (error) {
        this.logger.error('Error buying numbers', error);
        throw new InternalServerErrorException('Failed to buy numbers');
      }
    } else {
      this.logger.error(`Vendor ${purchasedFromVendor} not found`);
      throw new NotFoundException(`Vendor ${purchasedFromVendor} not found`);
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
    const { number, vendor, region, status, instanceId, customerId } = query;
    this.logger.debug(
      `Searching for number: ${number}, region: ${region}, vendor: ${vendor}, status: ${status}, instanceId: ${instanceId}, customerId: ${customerId}`,
    );

    const searchCriteria: any = {};
    if (number) searchCriteria.number = number;
    if (region) searchCriteria.region = region;
    if (vendor) searchCriteria.vendor = vendor;
    if (status) searchCriteria.status = status;
    if (instanceId) searchCriteria.instanceId = new Types.ObjectId(instanceId);
    if (customerId) searchCriteria.customerId = new Types.ObjectId(customerId);

    return this.phoneNumberModel.find(searchCriteria).exec();
  }

  async deleteNumber(deleteNumberDTO: DeleteNumberDTO): Promise<void> {
    if (!deleteNumberDTO.number) {
      throw new BadRequestException('Number is required');
    }
    const numberToUpdate = deleteNumberDTO.number.startsWith('+')
      ? deleteNumberDTO.number
      : `+${deleteNumberDTO.number}`;

    const numberExists = await this.phoneNumberModel
      .findOne({ number: numberToUpdate })
      .exec();

    if (!numberExists) {
      throw new BadRequestException('Number not found');
    }

    try {
      await this.phoneNumberModel
        .updateOne(
          { number: numberToUpdate },
          {
            $set: {
              status: 'inactive',
              instanceId: '',
              tenantId: '',
            },
          },
        )
        .exec();
    } catch (error) {
      this.logger.error('Error deleting number', error);
      throw new InternalServerErrorException('Failed to delete number');
    }
  }

  async updateNumber(updateNumberDto: UpdateNumberDTO): Promise<void> {
    const { number, status, instance_id, customer_id, tenant_id } =
      updateNumberDto;
    if (!number) {
      throw new BadRequestException('Number is required');
    }
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    const numberToUpdate = number.startsWith('+') ? number : `+${number}`;

    if (status === NumberStatus.ACTIVE && !instance_id) {
      // validate instance_id against existing instances
      throw new BadRequestException(
        'Instance ID is required for active number',
      );
    }

    const setUpdate = {
      numberStatus: status,
      instanceId: instance_id,
      customerId: customer_id,
      tenantId: tenant_id,
    };

    if (status === NumberStatus.INACTIVE) {
      setUpdate.instanceId = '';
    }

    if (status === NumberStatus.DELETED) {
      setUpdate.instanceId = '';
      setUpdate.customerId = '';
      setUpdate.tenantId = '';
    }

    try {
      await this.phoneNumberModel
        .updateOne(
          { numberToUpdate },
          {
            $set: setUpdate,
          },
        )
        .exec();
    } catch (error) {
      this.logger.error('Error updating number', error);
      throw new InternalServerErrorException('Failed to update number');
    }
  }
}
