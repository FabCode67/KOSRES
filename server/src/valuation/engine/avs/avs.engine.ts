import { Injectable } from '@nestjs/common';
import {
  ValuationEngine, FieldSpec, DocSpec, ReportSectionSpec, CalculationOutcome,
} from '../valuation-engine.interface';
import { AvsInputs } from './avs.types';
import { scoreSimilarity } from './similarity.util';

function round(value: number, increment = 1): number {
  if (!increment || increment <= 1) return Math.round(value);
  return Math.round(value / increment) * increment;
}

/**
 * Pure calculation. Scores every candidate against the subject, ranks them,
 * keeps the top N above minScore, and computes a SIMILARITY-WEIGHTED average
 * price (unlike plain Sales Comparison's flat mean — a comparable that's a
 * closer match contributes more). Every score, its contributing factors,
 * and the confidence of the overall estimate are returned in `breakdown` —
 * this must never collapse into an unexplained number. The result is always
 * SYSTEM_CALCULATED and is expected to go through the same valuer
 * review/override path as every other engine before it's relied upon.
 */
export function calculateAvs(inputs: AvsInputs, roundingIncrement = 1): CalculationOutcome {
  const topN = inputs.topN ?? 5;
  const minScore = inputs.minScore ?? 0.3;

  const scored = inputs.candidates.map((c) => {
    const { score, factors } = scoreSimilarity(inputs.subject, c);
    return { id: c.id, label: c.label, price: c.price, similarityScore: score, factors };
  }).sort((a, b) => b.similarityScore - a.similarityScore);

  const selected = scored.filter((c) => c.similarityScore >= minScore).slice(0, topN);
  const excluded = scored.filter((c) => !selected.includes(c));

  const totalWeight = selected.reduce((sum, c) => sum + c.similarityScore, 0);
  const indicatedValueRaw = totalWeight > 0
    ? selected.reduce((sum, c) => sum + c.price * c.similarityScore, 0) / totalWeight
    : 0;
  const indicatedValue = round(indicatedValueRaw, roundingIncrement);

  const averageSimilarity = selected.length ? totalWeight / selected.length : 0;
  const confidence: 'low' | 'medium' | 'high' =
    selected.length < 3 || averageSimilarity < 0.5 ? 'low' : averageSimilarity < 0.75 ? 'medium' : 'high';

  const warnings: string[] = [];
  if (selected.length < 3) warnings.push(`Only ${selected.length} comparable(s) met the similarity threshold — result should be treated with caution.`);
  if (averageSimilarity < 0.5) warnings.push('Average similarity of selected comparables is low — consider adding more market evidence to the comparable database.');

  const results: CalculationOutcome['results'] = [
    { basis: 'MARKET', amount: indicatedValue, method: 'SYSTEM_CALCULATED', source: 'avs_v1' },
  ];
  if (inputs.forcedSaleRule) {
    results.push({
      basis: 'FORCED_SALE', amount: round(indicatedValue * inputs.forcedSaleRule.percentage, roundingIncrement),
      method: 'SYSTEM_CALCULATED', source: `${inputs.forcedSaleRule.ruleCode} v${inputs.forcedSaleRule.ruleVersion}`,
    });
  }
  if (inputs.insuranceValue) {
    results.push({ basis: 'INSURANCE', amount: inputs.insuranceValue.amount, method: inputs.insuranceValue.method, source: inputs.insuranceValue.source });
  }

  return {
    breakdown: {
      selected, excluded, confidence, averageSimilarity: Math.round(averageSimilarity * 100) / 100,
      warnings, indicatedValue, modelVersion: 'avs_v1',
    },
    results,
  };
}

@Injectable()
export class AvsEngine implements ValuationEngine<AvsInputs> {
  code = 'AVS';

  getRequiredFields(_propertyCategory: string): FieldSpec[] {
    return [{ key: 'subject', label: 'Subject property characteristics', required: true, type: 'json' }];
  }

  getRequiredDocuments(_propertyCategory: string): DocSpec[] {
    return [];
  }

  getReportSections(): ReportSectionSpec[] {
    return [
      { key: 'cover_page', label: 'Cover Page', order: 1 },
      { key: 'model_explanation', label: 'Model & Comparable Selection', order: 2 },
      { key: 'confidence_indicators', label: 'Confidence & Warnings', order: 3 },
      { key: 'indicated_value', label: 'Indicated Value', order: 4 },
      { key: 'valuer_review', label: 'Valuer Review & Adjustments', order: 5 },
      { key: 'valuation_certificate', label: 'Valuation Certificate', order: 6 },
    ];
  }

  validateInputs(inputs: AvsInputs): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!inputs.candidates?.length) errors.push('No candidate comparables were supplied to score');
    return { valid: errors.length === 0, errors };
  }

  calculate(inputs: AvsInputs): CalculationOutcome {
    return calculateAvs(inputs, 100000);
  }
}
