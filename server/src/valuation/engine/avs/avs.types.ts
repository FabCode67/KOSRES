import { PropertyCharacteristics } from './similarity.util';

export interface AvsCandidateInput extends PropertyCharacteristics {
  id: string;
  label: string;
  price: number;
}

export interface AvsInputs {
  subject: PropertyCharacteristics;
  candidates: AvsCandidateInput[];
  topN?: number;         // how many best-matching comparables to include — default 5
  minScore?: number;     // exclude candidates scoring below this — default 0.3

  forcedSaleRule?: { percentage: number; ruleCode: string; ruleVersion: number };
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };
  valuationDate: string;
}
