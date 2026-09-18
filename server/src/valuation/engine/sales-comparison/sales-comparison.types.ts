export interface ComparableInput {
  id: string;
  label: string; // e.g. address or reference, for display
  price: number;
  included: boolean;
  adjustments: { factor: string; amount: number; reason: string }[];
}

export interface SalesComparisonInputs {
  comparables: ComparableInput[];
  forcedSaleRule?: { percentage: number; ruleCode: string; ruleVersion: number };
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };
  valuationDate: string;
}
