import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PhoneNumbersModule } from './modules/phone-numbers/phone-numbers.module';
import { PhoneNumbersService } from './modules/phone-numbers/phone-numbers.service';
import { PhoneVendorsModule } from './modules/phone-vendors/phone-vendors.module';
import { PhoneVendorsFactory } from './modules/phone-vendors/phone-vendors.factory';
import { MongooseModule } from '@nestjs/mongoose';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        formatters: {
          level(level: any) {
            return { level };
          },
        },
        customProps: () => ({
          context: 'HTTP',
        }),
        transport: isProduction
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                singleLine: true,
              },
            },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: 'numbers_service',
      }),
    }),
    PhoneNumbersModule,
    PhoneVendorsModule,
  ],
  controllers: [],
  providers: [PhoneNumbersService, PhoneVendorsFactory],
})
export class AppModule {}
