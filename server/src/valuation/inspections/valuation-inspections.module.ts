import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuationInspection, ValuationInspectionNote } from '../entities/valuation-inspection.entity';
import { ValuationInspectionsService } from './valuation-inspections.service';
import { ValuationInspectionsController } from './valuation-inspections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ValuationInspection, ValuationInspectionNote])],
  providers: [ValuationInspectionsService],
  controllers: [ValuationInspectionsController],
  exports: [ValuationInspectionsService],
})
export class ValuationInspectionsModule {}
