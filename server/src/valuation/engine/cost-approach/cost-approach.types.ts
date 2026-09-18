export type WorkUnitInput = 'SQM' | 'LINEAR_M' | 'ITEM' | 'LUMP_SUM';

export interface BuildingComponentInput {
  name: string;
  areaSqm: number;
  adoptedRatePerSqm: number;
}

export interface ExternalWorkInput {
  name: string;
  unit: WorkUnitInput;
  quantity: number;
  adoptedRate: number;
}

export interface DepreciationRuleInput {
  method: 'FLAT_RATE'; // Phase 1 — architecture allows other methods later
  rate: number;
  ruleCode: string;
  ruleVersion: number;
}

export interface DeveloperProfitRuleInput {
  rate: number;
  completionPercentage: number; // 0..1
  ruleCode: string;
  ruleVersion: number;
}

export interface ForcedSaleRuleInput {
  percentage: number;
  ruleCode: string;
  ruleVersion: number;
}

/**
 * Insurance Value is deliberately NOT auto-derived by a hard-coded formula
 * (business decision). Either omitted, or supplied as a valuer-adopted
 * figure with justification, or (later) via an explicit CalculationRule.
 */
export interface InsuranceValueInput {
  method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED';
  amount: number;
  source: string;
  justification: string;
  ruleCode?: string;
  ruleVersion?: number;
}

export interface CostApproachInputs {
  landAreaSqm: number;
  adoptedLandRatePerSqm: number;
  landRateSource: string;

  buildingComponents: BuildingComponentInput[];
  externalWorks: ExternalWorkInput[];

  depreciationRule: DepreciationRuleInput;
  developerProfitRule: DeveloperProfitRuleInput;
  forcedSaleRule?: ForcedSaleRuleInput;
  insuranceValue?: InsuranceValueInput;

  valuationDate: string;
}
