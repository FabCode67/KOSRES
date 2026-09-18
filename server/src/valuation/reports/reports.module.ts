import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuationReportEntity } from '../entities/valuation-report.entity';
import { ValuationApproval } from '../entities/valuation-approval.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ValuationRequestsModule } from '../requests/valuation-requests.module';
import { UploadModule } from '../../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValuationReportEntity, ValuationApproval]),
    ValuationRequestsModule,
    UploadModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
