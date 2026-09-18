import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValuationCalculation, ValuationResult } from '../entities/valuation-calculation.entity';
import { ValuationAdjustment } from '../entities/valuation-calculation.entity';
import { EngineRegistry } from '../engine/engines.module';
import { CalculationRulesService } from '../calculation-rules/calculation-rules.service';
import { CostApproachInputs } from '../engine/cost-approach/cost-approach.types';
import { SalesComparisonInputs } from '../engine/sales-comparison/sales-comparison.types';
import { IncomeApproachInputs } from '../engine/income-approach/income-approach.types';
import { AvsInputs } from '../engine/avs/avs.types';
import { CalculationOutcome } from '../engine/valuation-engine.interface';
import { ValuationPropertiesService } from '../properties/valuation-properties.service';
import { ComparablesService } from '../comparables/comparables.service';

interface RunAvsDto {
  requestId: string;
  engineVersionId: string;
  topN?: number;
  minScore?: number;
  forcedSaleRuleCode?: string;
  forcedSaleRuleVersion?: number;
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };
  valuationDate: string;
}

interface RunIncomeApproachDto {
  requestId: string;
  engineVersionId: string;
  units: { name: string; unitType: string; monthlyRent: number; occupancyRate: number }[];
  otherAnnualIncome?: number;
  operatingExpenses: { name: string; annualAmount: number }[];
  adoptedCapRate: number;
  capRateSource: string;
  forcedSaleRuleCode?: string;
  forcedSaleRuleVersion?: number;
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };
  valuationDate: string;
}

interface RunSalesComparisonDto {
  requestId: string;
  engineVersionId: string;
  comparables: { id: string; label: string; price: number; included: boolean; adjustments: { factor: string; amount: number; reason: string }[] }[];
  forcedSaleRuleCode?: string;
  forcedSaleRuleVersion?: number;
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };
  valuationDate: string;
}

interface RunCostApproachDto {
  requestId: string;
  engineVersionId: string;
  landAreaSqm: number;
  adoptedLandRatePerSqm: number;
  landRateSource: string;
  buildingComponents: { name: string; areaSqm: number; adoptedRatePerSqm: number }[];
  externalWorks: { name: string; unit: 'SQM' | 'LINEAR_M' | 'ITEM' | 'LUMP_SUM'; quantity: number; adoptedRate: number }[];
  depreciationRuleCode: string;
  depreciationRuleVersion: number;
  developerProfitRuleCode: string;
  developerProfitRuleVersion: number;
  developerProfitCompletionPercentage?: number;
  forcedSaleRuleCode?: string;
  forcedSaleRuleVersion?: number;
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };
  valuationDate: string;
}

@Injectable()
export class ValuationCalculationsService {
  constructor(
    @InjectRepository(ValuationCalculation) private calcRepo: Repository<ValuationCalculation>,
    @InjectRepository(ValuationResult) private resultRepo: Repository<ValuationResult>,
    @InjectRepository(ValuationAdjustment) private adjustmentRepo: Repository<ValuationAdjustment>,
    private engines: EngineRegistry,
    private rules: CalculationRulesService,
    private properties: ValuationPropertiesService,
    private comparables: ComparablesService,
  ) {}

  async runCostApproach(dto: RunCostApproachDto, executedById: string) {
    const engine = this.engines.get('COST_APPROACH');

    const depreciationRule = await this.rules.getByCodeVersion(dto.depreciationRuleCode, dto.depreciationRuleVersion);
    const developerProfitRule = await this.rules.getByCodeVersion(dto.developerProfitRuleCode, dto.developerProfitRuleVersion);
    const forcedSaleRule = dto.forcedSaleRuleCode
      ? await this.rules.getByCodeVersion(dto.forcedSaleRuleCode, dto.forcedSaleRuleVersion!)
      : undefined;

    const inputs: CostApproachInputs = {
      landAreaSqm: dto.landAreaSqm,
      adoptedLandRatePerSqm: dto.adoptedLandRatePerSqm,
      landRateSource: dto.landRateSource,
      buildingComponents: dto.buildingComponents,
      externalWorks: dto.externalWorks,
      depreciationRule: {
        method: 'FLAT_RATE',
        rate: (depreciationRule.params as any).rate,
        ruleCode: depreciationRule.code,
        ruleVersion: depreciationRule.version,
      },
      developerProfitRule: {
        rate: (developerProfitRule.params as any).rate,
        completionPercentage: dto.developerProfitCompletionPercentage ?? 1,
        ruleCode: developerProfitRule.code,
        ruleVersion: developerProfitRule.version,
      },
      forcedSaleRule: forcedSaleRule
        ? { percentage: (forcedSaleRule.params as any).percentage, ruleCode: forcedSaleRule.code, ruleVersion: forcedSaleRule.version }
        : undefined,
      insuranceValue: dto.insuranceValue,
      valuationDate: dto.valuationDate,
    };

    const validation = engine.validateInputs(inputs);
    if (!validation.valid) throw new BadRequestException(validation.errors.join('; '));

    const outcome = engine.calculate(inputs);

    return this.persist(dto.requestId, dto.engineVersionId,
      [{ source: dto.landRateSource }],
      [
        { code: depreciationRule.code, version: depreciationRule.version, type: depreciationRule.type },
        { code: developerProfitRule.code, version: developerProfitRule.version, type: developerProfitRule.type },
        ...(forcedSaleRule ? [{ code: forcedSaleRule.code, version: forcedSaleRule.version, type: forcedSaleRule.type }] : []),
      ],
      inputs, outcome, dto.valuationDate, dto.insuranceValue?.justification, executedById,
    );
  }

  async runSalesComparison(dto: RunSalesComparisonDto, executedById: string) {
    const engine = this.engines.get('SALES_COMPARISON');

    const forcedSaleRule = dto.forcedSaleRuleCode
      ? await this.rules.getByCodeVersion(dto.forcedSaleRuleCode, dto.forcedSaleRuleVersion!)
      : undefined;

    const inputs: SalesComparisonInputs = {
      comparables: dto.comparables,
      forcedSaleRule: forcedSaleRule
        ? { percentage: (forcedSaleRule.params as any).percentage, ruleCode: forcedSaleRule.code, ruleVersion: forcedSaleRule.version }
        : undefined,
      insuranceValue: dto.insuranceValue,
      valuationDate: dto.valuationDate,
    };

    const validation = engine.validateInputs(inputs);
    if (!validation.valid) throw new BadRequestException(validation.errors.join('; '));

    const outcome = engine.calculate(inputs);

    return this.persist(dto.requestId, dto.engineVersionId,
      [],
      forcedSaleRule ? [{ code: forcedSaleRule.code, version: forcedSaleRule.version, type: forcedSaleRule.type }] : [],
      inputs, outcome, dto.valuationDate, dto.insuranceValue?.justification, executedById,
    );
  }

  async runIncomeApproach(dto: RunIncomeApproachDto, executedById: string) {
    const engine = this.engines.get('INCOME_APPROACH');

    const forcedSaleRule = dto.forcedSaleRuleCode
      ? await this.rules.getByCodeVersion(dto.forcedSaleRuleCode, dto.forcedSaleRuleVersion!)
      : undefined;

    const inputs: IncomeApproachInputs = {
      units: dto.units,
      otherAnnualIncome: dto.otherAnnualIncome,
      operatingExpenses: dto.operatingExpenses,
      adoptedCapRate: dto.adoptedCapRate,
      capRateSource: dto.capRateSource,
      forcedSaleRule: forcedSaleRule
        ? { percentage: (forcedSaleRule.params as any).percentage, ruleCode: forcedSaleRule.code, ruleVersion: forcedSaleRule.version }
        : undefined,
      insuranceValue: dto.insuranceValue,
      valuationDate: dto.valuationDate,
    };

    const validation = engine.validateInputs(inputs);
    if (!validation.valid) throw new BadRequestException(validation.errors.join('; '));

    const outcome = engine.calculate(inputs);

    return this.persist(dto.requestId, dto.engineVersionId,
      [],
      forcedSaleRule ? [{ code: forcedSaleRule.code, version: forcedSaleRule.version, type: forcedSaleRule.type }] : [],
      inputs, outcome, dto.valuationDate, dto.insuranceValue?.justification, executedById,
    );
  }

  async runAvs(dto: RunAvsDto, executedById: string) {
    const engine = this.engines.get('AVS');

    const property = await this.properties.findByRequest(dto.requestId);
    if (!property) throw new BadRequestException('Cannot run AVS before property data has been entered');

    const subject = {
      district: property.location?.district,
      plotAreaSqm: property.land?.plotSizeSqm,
      buildingAreaSqm: property.buildings?.reduce((sum, b) => sum + Number(b.areaSqm), 0) || undefined,
      condition: property.buildings?.[0]?.condition,
      ageYears: property.buildings?.[0]?.constructionYear ? new Date().getFullYear() - property.buildings[0].constructionYear : undefined,
    };

    const pool = await this.comparables.findAll(property.location?.district);
    const candidates = pool
      .filter((c) => c.transactions?.length)
      .map((c) => ({
        id: c.id,
        label: [c.sector, c.district].filter(Boolean).join(', ') || c.id,
        price: Number(c.transactions[0].price),
        district: c.district, plotAreaSqm: c.plotAreaSqm, buildingAreaSqm: c.buildingAreaSqm,
        bedrooms: c.bedrooms, ageYears: c.ageYears, condition: c.condition, cbdDistanceKm: c.cbdDistanceKm,
      }));

    const forcedSaleRule = dto.forcedSaleRuleCode
      ? await this.rules.getByCodeVersion(dto.forcedSaleRuleCode, dto.forcedSaleRuleVersion!)
      : undefined;

    const inputs: AvsInputs = {
      subject,
      candidates,
      topN: dto.topN,
      minScore: dto.minScore,
      forcedSaleRule: forcedSaleRule
        ? { percentage: (forcedSaleRule.params as any).percentage, ruleCode: forcedSaleRule.code, ruleVersion: forcedSaleRule.version }
        : undefined,
      insuranceValue: dto.insuranceValue,
      valuationDate: dto.valuationDate,
    };

    const validation = engine.validateInputs(inputs);
    if (!validation.valid) throw new BadRequestException(validation.errors.join('; '));

    const outcome = engine.calculate(inputs);

    return this.persist(dto.requestId, dto.engineVersionId,
      [],
      forcedSaleRule ? [{ code: forcedSaleRule.code, version: forcedSaleRule.version, type: forcedSaleRule.type }] : [],
      inputs, outcome, dto.valuationDate, dto.insuranceValue?.justification, executedById,
    );
  }

  private async persist(
    requestId: string, engineVersionId: string, rateTablesUsed: any[], calculationRulesUsed: any[],
    inputs: any, outcome: CalculationOutcome, valuationDate: string, insuranceJustification: string | undefined, executedById: string,
  ) {
    const calculation = this.calcRepo.create({
      request: { id: requestId } as any,
      engineVersion: { id: engineVersionId } as any,
      rateTablesUsed,
      calculationRulesUsed,
      inputsSnapshot: inputs as any,
      outputsSnapshot: outcome.breakdown as any,
      executedById,
    });
    const savedCalc = await this.calcRepo.save(calculation);

    const results = this.resultRepo.create(
      outcome.results.map((r) => ({
        request: { id: requestId } as any,
        calculation: { id: savedCalc.id } as any,
        basis: r.basis.toLowerCase() as any,
        amount: r.amount,
        valuationDate,
        method: r.method.toLowerCase() as any,
        source: r.source,
        justification: r.basis === 'INSURANCE' ? insuranceJustification : undefined,
        createdById: executedById,
      })),
    );
    await this.resultRepo.save(results);

    return { ...savedCalc, results };
  }

  /**
   * Records a valuer override on a specific result (e.g. Open Market Value)
   * with a mandatory reason, then updates the adopted amount — the original
   * value and the reason are preserved in valuation_adjustments for audit,
   * per the "every manual override must be recorded" requirement.
   */
  async addAdjustment(resultId: string, data: { newValue: number; reason: string }, authorId: string) {
    const result = await this.resultRepo.findOneOrFail({ where: { id: resultId } });
    if (!data.reason?.trim()) throw new BadRequestException('A reason is required for every override');

    await this.adjustmentRepo.save(this.adjustmentRepo.create({
      result: { id: resultId } as any,
      field: 'amount',
      originalValue: String(result.amount),
      newValue: String(data.newValue),
      reason: data.reason,
      authorId,
    }));

    await this.resultRepo.update(resultId, { amount: data.newValue, method: 'valuer_adopted' as any });
    return this.resultRepo.findOneOrFail({ where: { id: resultId }, relations: ['adjustments'] });
  }
}
