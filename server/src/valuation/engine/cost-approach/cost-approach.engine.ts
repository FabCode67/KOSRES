import { Injectable } from '@nestjs/common';
import {
  ValuationEngine, FieldSpec, DocSpec, ReportSectionSpec, CalculationOutcome,
} from '../valuation-engine.interface';
import { CostApproachInputs } from './cost-approach.types';

function round(value: number, increment = 1): number {
  if (!increment || increment <= 1) return Math.round(value);
  return Math.round(value / increment) * increment;
}

/**
 * Pure calculation — no DB, no I/O. Every intermediate figure is returned in
 * `breakdown` so nothing is a black box. `roundingIncrement` defaults to 1
 * (no rounding); pass 100000 to match KOSRES's current practice of rounding
 * adopted values to the nearest RWF 100,000.
 */
export function calculateCostApproach(inputs: CostApproachInputs, roundingIncrement = 1): CalculationOutcome {
  // ── Land Value ──
  const landValueRaw = inputs.landAreaSqm * inputs.adoptedLandRatePerSqm;
  const landValue = round(landValueRaw, roundingIncrement);

  // ── Building components (replacement cost) ──
  const buildingLines = inputs.buildingComponents.map((c) => ({
    name: c.name,
    areaSqm: c.areaSqm,
    ratePerSqm: c.adoptedRatePerSqm,
    replacementCost: c.areaSqm * c.adoptedRatePerSqm,
  }));
  const buildingSubtotal = buildingLines.reduce((sum, l) => sum + l.replacementCost, 0);

  // ── External works ──
  const externalWorkLines = inputs.externalWorks.map((w) => ({
    name: w.name,
    unit: w.unit,
    quantity: w.quantity,
    rate: w.adoptedRate,
    cost: w.quantity * w.adoptedRate,
  }));
  const externalWorksSubtotal = externalWorkLines.reduce((sum, l) => sum + l.cost, 0);

  // ── Total development cost ──
  const totalDevelopmentCost = buildingSubtotal + externalWorksSubtotal;

  // ── Depreciation (flat-rate for Phase 1) ──
  const depreciationAmount = totalDevelopmentCost * inputs.depreciationRule.rate;
  const depreciatedReplacementCost = totalDevelopmentCost - depreciationAmount;

  // ── Developer's profit ──
  const developerProfitAmount =
    depreciatedReplacementCost *
    inputs.developerProfitRule.rate *
    (inputs.developerProfitRule.completionPercentage ?? 1);

  // ── Development Value ──
  const developmentValueRaw = depreciatedReplacementCost + developerProfitAmount;
  const developmentValue = round(developmentValueRaw, roundingIncrement);

  // ── Open Market Value ──
  const openMarketValueRaw = landValue + developmentValue;
  const openMarketValue = round(openMarketValueRaw, roundingIncrement);

  const results: CalculationOutcome['results'] = [
    { basis: 'LAND', amount: landValue, method: 'SYSTEM_CALCULATED', source: inputs.landRateSource },
    { basis: 'DEVELOPMENT', amount: developmentValue, method: 'SYSTEM_CALCULATED', source: 'cost_approach_v1' },
    { basis: 'MARKET', amount: openMarketValue, method: 'SYSTEM_CALCULATED', source: 'cost_approach_v1' },
  ];

  // ── Forced Sale Value (optional — configurable rule) ──
  if (inputs.forcedSaleRule) {
    const forcedSaleValue = round(openMarketValue * inputs.forcedSaleRule.percentage, roundingIncrement);
    results.push({
      basis: 'FORCED_SALE',
      amount: forcedSaleValue,
      method: 'SYSTEM_CALCULATED',
      source: `${inputs.forcedSaleRule.ruleCode} v${inputs.forcedSaleRule.ruleVersion}`,
    });
  }

  // ── Insurance Value (optional — never auto-derived from OMV) ──
  if (inputs.insuranceValue) {
    results.push({
      basis: 'INSURANCE',
      amount: inputs.insuranceValue.amount,
      method: inputs.insuranceValue.method,
      source: inputs.insuranceValue.source,
    });
  }

  return {
    breakdown: {
      land: { areaSqm: inputs.landAreaSqm, ratePerSqm: inputs.adoptedLandRatePerSqm, value: landValue, source: inputs.landRateSource },
      buildingLines,
      buildingSubtotal,
      externalWorkLines,
      externalWorksSubtotal,
      totalDevelopmentCost,
      depreciation: { rate: inputs.depreciationRule.rate, amount: depreciationAmount, ruleCode: inputs.depreciationRule.ruleCode, ruleVersion: inputs.depreciationRule.ruleVersion },
      depreciatedReplacementCost,
      developerProfit: { rate: inputs.developerProfitRule.rate, completionPercentage: inputs.developerProfitRule.completionPercentage, amount: developerProfitAmount, ruleCode: inputs.developerProfitRule.ruleCode, ruleVersion: inputs.developerProfitRule.ruleVersion },
      developmentValue,
      openMarketValue,
    },
    results,
  };
}

@Injectable()
export class CostApproachEngine implements ValuationEngine<CostApproachInputs> {
  code = 'COST_APPROACH';

  getRequiredFields(_propertyCategory: string): FieldSpec[] {
    return [
      { key: 'land.plotSizeSqm', label: 'Plot Size (sqm)', required: true, type: 'number' },
      { key: 'land.adoptedRatePerSqm', label: 'Adopted Land Rate (RWF/sqm)', required: true, type: 'number' },
      { key: 'buildings', label: 'Building Components', required: true, type: 'json' },
      { key: 'externalWorks', label: 'External Works', required: false, type: 'json' },
      { key: 'depreciationRuleCode', label: 'Depreciation Rule', required: true, type: 'select' },
      { key: 'developerProfitRuleCode', label: "Developer's Profit Rule", required: true, type: 'select' },
    ];
  }

  getRequiredDocuments(_propertyCategory: string): DocSpec[] {
    return [{ key: 'title_deed', label: 'Title Deed', required: true }];
  }

  getReportSections(): ReportSectionSpec[] {
    return [
      { key: 'cover_page', label: 'Cover Page', order: 1 },
      { key: 'terms_of_engagement', label: 'Terms of Engagement', order: 2 },
      { key: 'property_features', label: 'Property Features', order: 3 },
      { key: 'construction_details', label: 'Construction Details', order: 4 },
      { key: 'valuation_analysis', label: 'Valuation Analysis', order: 5 },
      { key: 'valuation_disclaimer', label: 'Valuation Disclaimer', order: 6 },
      { key: 'property_images', label: 'Property Images', order: 7 },
      { key: 'valuation_certificate', label: 'Valuation Certificate', order: 8 },
    ];
  }

  validateInputs(inputs: CostApproachInputs): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!inputs.landAreaSqm || inputs.landAreaSqm <= 0) errors.push('landAreaSqm must be > 0');
    if (!inputs.adoptedLandRatePerSqm || inputs.adoptedLandRatePerSqm <= 0) errors.push('adoptedLandRatePerSqm must be > 0');
    // A vacant plot has no building components: only the land value is produced.
    if (!Array.isArray(inputs.buildingComponents)) errors.push('buildingComponents must be an array (empty for a vacant plot)');
    inputs.buildingComponents?.forEach((c, i) => {
      if (!c.areaSqm || c.areaSqm <= 0) errors.push(`buildingComponents[${i}].areaSqm must be > 0`);
      if (!c.adoptedRatePerSqm || c.adoptedRatePerSqm <= 0) errors.push(`buildingComponents[${i}].adoptedRatePerSqm must be > 0`);
    });
    if (!inputs.depreciationRule) errors.push('depreciationRule is required');
    if (!inputs.developerProfitRule) errors.push('developerProfitRule is required');
    return { valid: errors.length === 0, errors };
  }

  calculate(inputs: CostApproachInputs): CalculationOutcome {
    return calculateCostApproach(inputs, 100000);
  }
}
