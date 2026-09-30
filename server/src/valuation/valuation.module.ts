import { Module } from '@nestjs/common';
import { RateTablesModule } from './rate-tables/rate-tables.module';
import { CalculationRulesModule } from './calculation-rules/calculation-rules.module';
import { EnginesModule } from './engine/engines.module';
import { ValuationRequestsModule } from './requests/valuation-requests.module';
import { ValuationPropertiesModule } from './properties/valuation-properties.module';
import { ValuationInspectionsModule } from './inspections/valuation-inspections.module';
import { ValuationCalculationsModule } from './calculations/valuation-calculations.module';
import { ReportsModule } from './reports/reports.module';
import { ComparablesModule } from './comparables/comparables.module';
import { CadastralModule } from './cadastral/cadastral.module';
import { EvaluationIntakesModule } from './evaluation-intakes/evaluation-intakes.module';

/**
 * Aggregates every valuation sub-module — import ONLY this into AppModule.
 * "KOSRES Property Valuation" — an additional advanced service of KOSRES,
 * sharing the same app, server, database, and login as everything else.
 */
@Module({
  imports: [
    RateTablesModule,
    CalculationRulesModule,
    EnginesModule,
    ValuationRequestsModule,
    ValuationPropertiesModule,
    ValuationInspectionsModule,
    ValuationCalculationsModule,
    ReportsModule,
    ComparablesModule,
    CadastralModule,
    EvaluationIntakesModule,
  ],
})
export class ValuationModule {}
