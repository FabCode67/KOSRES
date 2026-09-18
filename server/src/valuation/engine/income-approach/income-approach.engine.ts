import { Injectable } from '@nestjs/common';
import {
  ValuationEngine, FieldSpec, DocSpec, ReportSectionSpec, CalculationOutcome,
} from '../valuation-engine.interface';
import { IncomeApproachInputs } from './income-approach.types';

function round(value: number, increment = 1): number {
  if (!increment || increment <= 1) return Math.round(value);
  return Math.round(value / increment) * increment;
}

/**
 * Pure calculation — direct income capitalization, the standard MVP method:
 *
 *   Gross Potential Income (GPI) = Σ (monthlyRent × 12) for every unit
 *   Effective Gross Income (EGI) = Σ (monthlyRent × 12 × occupancyRate) + otherAnnualIncome
 *   Net Operating Income (NOI)   = EGI − Total Operating Expenses
 *   Property Value               = NOI ÷ Adopted Capitalization Rate
 *
 * The cap rate is always valuer-adopted and recorded with its source —
 * never a hard-coded constant. Every intermediate figure is returned in
 * `breakdown`, matching the transparency requirement used by the other
 * engines.
 */
export function calculateIncomeApproach(inputs: IncomeApproachInputs, roundingIncrement = 1): CalculationOutcome {
  const unitLines = inputs.units.map((u) => {
    const grossAnnual = u.monthlyRent * 12;
    const effectiveAnnual = grossAnnual * u.occupancyRate;
    return { name: u.name, unitType: u.unitType, monthlyRent: u.monthlyRent, occupancyRate: u.occupancyRate, grossAnnual, effectiveAnnual };
  });

  const grossPotentialIncome = unitLines.reduce((sum, l) => sum + l.grossAnnual, 0);
  const effectiveGrossIncome = unitLines.reduce((sum, l) => sum + l.effectiveAnnual, 0) + (inputs.otherAnnualIncome ?? 0);

  const expenseLines = inputs.operatingExpenses.map((e) => ({ name: e.name, annualAmount: e.annualAmount }));
  const totalOperatingExpenses = expenseLines.reduce((sum, e) => sum + e.annualAmount, 0);

  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

  const indicatedValueRaw = inputs.adoptedCapRate > 0 ? netOperatingIncome / inputs.adoptedCapRate : 0;
  const indicatedValue = round(indicatedValueRaw, roundingIncrement);

  const results: CalculationOutcome['results'] = [
    { basis: 'MARKET', amount: indicatedValue, method: 'SYSTEM_CALCULATED', source: `income_capitalization_v1 (${inputs.capRateSource})` },
  ];

  if (inputs.forcedSaleRule) {
    const forcedSaleValue = round(indicatedValue * inputs.forcedSaleRule.percentage, roundingIncrement);
    results.push({
      basis: 'FORCED_SALE', amount: forcedSaleValue, method: 'SYSTEM_CALCULATED',
      source: `${inputs.forcedSaleRule.ruleCode} v${inputs.forcedSaleRule.ruleVersion}`,
    });
  }
  if (inputs.insuranceValue) {
    results.push({ basis: 'INSURANCE', amount: inputs.insuranceValue.amount, method: inputs.insuranceValue.method, source: inputs.insuranceValue.source });
  }

  return {
    breakdown: {
      unitLines,
      grossPotentialIncome,
      otherAnnualIncome: inputs.otherAnnualIncome ?? 0,
      effectiveGrossIncome,
      expenseLines,
      totalOperatingExpenses,
      netOperatingIncome,
      adoptedCapRate: inputs.adoptedCapRate,
      capRateSource: inputs.capRateSource,
      indicatedValue,
    },
    results,
  };
}

@Injectable()
export class IncomeApproachEngine implements ValuationEngine<IncomeApproachInputs> {
  code = 'INCOME_APPROACH';

  getRequiredFields(_propertyCategory: string): FieldSpec[] {
    return [
      { key: 'units', label: 'Income-producing units', required: true, type: 'json' },
      { key: 'operatingExpenses', label: 'Operating expenses', required: true, type: 'json' },
      { key: 'adoptedCapRate', label: 'Adopted capitalization rate', required: true, type: 'number' },
    ];
  }

  getRequiredDocuments(_propertyCategory: string): DocSpec[] {
    return [];
  }

  getReportSections(): ReportSectionSpec[] {
    return [
      { key: 'cover_page', label: 'Cover Page', order: 1 },
      { key: 'rental_analysis', label: 'Rental Analysis', order: 2 },
      { key: 'income_expenses', label: 'Income & Expenses', order: 3 },
      { key: 'noi_capitalization', label: 'NOI & Capitalization', order: 4 },
      { key: 'indicated_value', label: 'Indicated Value', order: 5 },
      { key: 'valuation_certificate', label: 'Valuation Certificate', order: 6 },
    ];
  }

  validateInputs(inputs: IncomeApproachInputs): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!inputs.units?.length) errors.push('At least one income-producing unit is required');
    inputs.units?.forEach((u, i) => {
      if (u.monthlyRent == null || u.monthlyRent < 0) errors.push(`units[${i}].monthlyRent must be >= 0`);
      if (u.occupancyRate == null || u.occupancyRate < 0 || u.occupancyRate > 1) errors.push(`units[${i}].occupancyRate must be between 0 and 1`);
    });
    if (!inputs.adoptedCapRate || inputs.adoptedCapRate <= 0) errors.push('adoptedCapRate must be > 0');
    return { valid: errors.length === 0, errors };
  }

  calculate(inputs: IncomeApproachInputs): CalculationOutcome {
    return calculateIncomeApproach(inputs, 100000);
  }
}
