import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomersDocument = HydratedDocument<Customers>;

@Schema({ collection: 'customers' })
export class Customers {
  @Prop({ required: true })
  customerId: string;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers);
