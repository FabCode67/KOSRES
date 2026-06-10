import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule }            from './auth/auth.module';
import { PropertiesModule }      from './properties/properties.module';
import { InquiriesModule }       from './inquiries/inquiries.module';
import { UploadModule }          from './upload/upload.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type:        'postgres',
      url:         process.env.DATABASE_URL,
      ssl:         { rejectUnauthorized: false },
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
  ],
  providers: [],
})
export class AppModule {}
