import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostApproachEngine } from './cost-approach/cost-approach.engine';
import { SalesComparisonEngine } from './sales-comparison/sales-comparison.engine';
import { IncomeApproachEngine } from './income-approach/income-approach.engine';
import { AvsEngine } from './avs/avs.engine';
import { ValuationEngine } from './valuation-engine.interface';
import { ValuationEngineDefinition, ValuationEngineVersion } from '../entities/valuation-engine.entity';
import { EngineDefinitionsService } from './engine-definitions.service';
import { EngineDefinitionsController } from './engine-definitions.controller';

/** Registry so new engines can be added without touching consumers. */
@Injectable()
export class EngineRegistry {
  private engines = new Map<string, ValuationEngine<any>>();

  constructor(costApproach: CostApproachEngine, salesComparison: SalesComparisonEngine, incomeApproach: IncomeApproachEngine, avs: AvsEngine) {
    this.register(costApproach);
    this.register(salesComparison);
    this.register(incomeApproach);
    this.register(avs);
  }

  register(engine: ValuationEngine<any>) {
    this.engines.set(engine.code, engine);
  }

  get(code: string): ValuationEngine<any> {
    const engine = this.engines.get(code);
    if (!engine) throw new Error(`Unknown valuation engine: ${code}`);
    return engine;
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([ValuationEngineDefinition, ValuationEngineVersion])],
  providers: [CostApproachEngine, SalesComparisonEngine, IncomeApproachEngine, AvsEngine, EngineRegistry, EngineDefinitionsService],
  controllers: [EngineDefinitionsController],
  exports: [EngineRegistry, CostApproachEngine, SalesComparisonEngine, IncomeApproachEngine, AvsEngine, EngineDefinitionsService],
})
export class EnginesModule {}
