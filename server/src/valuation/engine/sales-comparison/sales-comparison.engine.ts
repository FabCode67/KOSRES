import { Injectable } from '@nestjs/common';
import {
  ValuationEngine, FieldSpec, DocSpec, ReportSectionSpec, CalculationOutcome,
} from '../valuation-engine.interface';
import { SalesComparisonInputs } from './sales-comparison.types';

function round(value: number, increment = 1): number {
  if (!increment || increment <= 1) return Math.round(value);
  return Math.round(value / increment) * increment;
}

/**
 * Pure calculation. Each INCLUDED comparable's price is adjusted by the sum
 * of its adjustment amounts (positive or negative, one per differing factor
 * e.g. condition, location, size). The indicated value is the simple mean
 * of the adjusted prices — a straightforward, explainable technique
 * appropriate before a real comparable database and regression model exist
 * (see AVS, a future phase). Every comparable's contribution is returned in
 * `breakdown`, never collapsed into a black-box number.
 */
export function calculateSalesComparison(inputs: SalesComparisonInputs, roundingIncrement = 1): CalculationOutcome {
  const included = inputs.comparables.filter((c) => c.included);

  const comparableLines = inputs.comparables.map((c) => {
    const adjustmentTotal = c.adjustments.reduce((sum, a) => sum + a.amount, 0);
    return {
      id: c.id,
      label: c.label,
      included: c.included,
      basePrice: c.price,
      adjustments: c.adjustments,
      adjustmentTotal,
      adjustedPrice: c.price + adjustmentTotal,
    };
  });

  const includedLines = comparableLines.filter((l) => l.included);
  const indicatedValueRaw = includedLines.length
    ? includedLines.reduce((sum, l) => sum + l.adjustedPrice, 0) / includedLines.length
    : 0;
  const indicatedValue = round(indicatedValueRaw, roundingIncrement);

  const results: CalculationOutcome['results'] = [
    { basis: 'MARKET', amount: indicatedValue, method: 'SYSTEM_CALCULATED', source: 'sales_comparison_v1' },
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
      comparableLines,
      includedCount: includedLines.length,
      totalCount: comparableLines.length,
      indicatedValue,
    },
    results,
  };
}

@Injectable()
export class SalesComparisonEngine implements ValuationEngine<SalesComparisonInputs> {
  code = 'SALES_COMPARISON';

  getRequiredFields(_propertyCategory: string): FieldSpec[] {
    return [{ key: 'comparables', label: 'Comparable transactions', required: true, type: 'json' }];
  }

  getRequiredDocuments(_propertyCategory: string): DocSpec[] {
    return [];
  }

  getReportSections(): ReportSectionSpec[] {
    return [
      { key: 'cover_page', label: 'Cover Page', order: 1 },
      { key: 'comparable_analysis', label: 'Comparable Analysis', order: 2 },
      { key: 'adjustments', label: 'Adjustments', order: 3 },
      { key: 'indicated_value', label: 'Indicated Value', order: 4 },
      { key: 'valuation_certificate', label: 'Valuation Certificate', order: 5 },
    ];
  }

  validateInputs(inputs: SalesComparisonInputs): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const included = inputs.comparables?.filter((c) => c.included) ?? [];
    if (included.length === 0) errors.push('At least one included comparable is required');
    if (included.length > 0 && included.length < 3) {
      // Soft guidance only — real professional practice prefers 3+, but the
      // valuer retains authority to proceed with fewer if justified.
    }
    return { valid: errors.length === 0, errors };
  }

  calculate(inputs: SalesComparisonInputs): CalculationOutcome {
    return calculateSalesComparison(inputs, 100000);
  }
}
