import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuationCalculation, ValuationResult, ValuationAdjustment } from '../entities/valuation-calculation.entity';
import { ValuationCalculationsService } from './valuation-calculations.service';
import { ValuationCalculationsController } from './valuation-calculations.controller';
import { EnginesModule } from '../engine/engines.module';
import { CalculationRulesModule } from '../calculation-rules/calculation-rules.module';
import { ValuationPropertiesModule } from '../properties/valuation-properties.module';
import { ComparablesModule } from '../comparables/comparables.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValuationCalculation, ValuationResult, ValuationAdjustment]),
    EnginesModule, CalculationRulesModule, ValuationPropertiesModule, ComparablesModule,
  ],
  providers: [ValuationCalculationsService],
  controllers: [ValuationCalculationsController],
  exports: [ValuationCalculationsService],
})
export class ValuationCalculationsModule {}
