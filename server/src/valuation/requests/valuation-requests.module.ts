import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuationRequest, WorkflowTransition } from '../entities/valuation-request.entity';
import { ValuationApproval } from '../entities/valuation-approval.entity';
import { User } from '../../users/user.entity';
import { ValuationRequestsService } from './valuation-requests.service';
import { ValuationRequestsController } from './valuation-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ValuationRequest, WorkflowTransition, ValuationApproval, User])],
  providers: [ValuationRequestsService],
  controllers: [ValuationRequestsController],
  exports: [ValuationRequestsService],
})
export class ValuationRequestsModule {}
