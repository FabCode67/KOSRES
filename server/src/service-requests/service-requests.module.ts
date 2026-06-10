import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './service-request.entity';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest])],
  providers: [ServiceRequestsService],
  controllers: [ServiceRequestsController],
})
export class ServiceRequestsModule {}
