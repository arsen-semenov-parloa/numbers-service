import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type PhoneNumberDocument = HydratedDocument<PhoneNumber>;

mongoose.set('debug', true);

export enum NumberStatus {
  ACTIVE = 'active', // assigned to a instance
  INACTIVE = 'inactive', // not assigned to any instance. released to pool
  NEW = 'new', // newly created, not assigned to any instance
  DELETED = 'deleted', // deleted
}

@Schema({ timestamps: true, collection: 'phone_numbers' })
export class PhoneNumber {
  @Prop({ type: String })
  number: string;

  @Prop({ type: String })
  status: NumberStatus;

  @Prop({ type: String })
  vendor: string; // vendor or csv

  @Prop({ type: String })
  region?: string;

  @Prop({ type: Types.ObjectId })
  tenantId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  instanceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  customerId?: Types.ObjectId;

  @Prop({ type: String })
  createdBy?: Types.ObjectId;

  @Prop({ type: Date })
  ceatedAt?: Date;

  @Prop({ type: Date, default: `` })
  end_date?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);
