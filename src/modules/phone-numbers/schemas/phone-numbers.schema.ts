import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type PhoneNumberDocument = HydratedDocument<PhoneNumber>;

mongoose.set('debug', true);

enum enumStatus {
  Active = 'active',
  Inactive = 'inactive',
  New = 'new',
  Deleted = 'deleted',
}

@Schema({ timestamps: true, collection: 'phone_numbers' })
export class PhoneNumber {
  @Prop({ type: String })
  number?: string;

  @Prop({ type: String })
  status?: string;

  @Prop({ type: String })
  pruchaseFrom: string | undefined; // vendor, twilio, nexmo, etc, csv

  @Prop({ type: String })
  region: string | undefined;

  @Prop({ type: Types.ObjectId })
  tenantId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  instanceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  customerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  ceatedAt?: Date;

  @Prop({ type: Types.ObjectId })
  updatedAt?: Date;
}

export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);
