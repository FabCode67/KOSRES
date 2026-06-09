import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      entities: [join(__dirname, '**/*.entity{.ts,.js}')],
      migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),

    AuthModule,
    PropertiesModule,
    InquiriesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
