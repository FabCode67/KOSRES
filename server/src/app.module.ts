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

// SSL only for external cloud databases (Neon, RDS, etc.)
// Disabled for self-hosted local PostgreSQL on Contabo/Hetzner
const dbUrl = process.env.DATABASE_URL ?? '';
const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type:        'postgres',
      url:         dbUrl,
      ssl:         isLocalDb ? false : { rejectUnauthorized: false },
      entities:    [join(__dirname, '**/*.entity{.ts,.js}')],
      migrations:  [join(__dirname, 'migrations/*{.ts,.js}')],
      synchronize: false,
      logging:     process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    PropertiesModule,
    InquiriesModule,
    UploadModule,
    ServiceRequestsModule,
    PublicationsModule,
    PartnersModule,
    CarsModule,
  ],
})
export class AppModule {}
