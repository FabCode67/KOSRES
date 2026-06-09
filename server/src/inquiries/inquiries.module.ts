import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './inquiry.entity';
import { Property } from '../properties/property.entity';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, Property])],
  providers: [InquiriesService],
  controllers: [InquiriesController],
})
export class InquiriesModule {}
