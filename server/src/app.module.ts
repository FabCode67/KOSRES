import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule }            from './auth/auth.module';
import { PropertiesModule }      from './properties/properties.module';
import { InquiriesModule }       from './inquiries/inquiries.module';
import { UploadModule }          from './upload/upload.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { PublicationsModule }    from './publications/publications.module';
import { PartnersModule }        from './partners/partners.module';
import { CarsModule }            from './cars/cars.module';
import { StaffModule }           from './staff/staff.module';

@Module({
  imports: [
    // Load .env FIRST before anything else
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Use forRootAsync so DATABASE_URL is read AFTER dotenv loads
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbUrl = process.env.DATABASE_URL ?? '';
        const isLocal = dbUrl.includes('localhost') ||
                        dbUrl.includes('127.0.0.1');
        return {
          type:        'postgres',
          url:         dbUrl,
          ssl:         isLocal ? false : { rejectUnauthorized: false },
          entities:    [join(__dirname, '**/*.entity{.ts,.js}')],
          migrations:  [join(__dirname, 'migrations/*{.ts,.js}')],
          synchronize: false,
          logging:     false,
        };
      },
    }),

    AuthModule,
    PropertiesModule,
    InquiriesModule,
    UploadModule,
    ServiceRequestsModule,
    PublicationsModule,
    PartnersModule,
    CarsModule,
    StaffModule,
  ],
})
export class AppModule {}
