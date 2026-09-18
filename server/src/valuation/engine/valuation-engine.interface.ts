/**
 * The ValuationEngine contract every methodology (Cost Approach, Sales
 * Comparison, Income Approach, AVS, MVS) must implement. Adding a new engine
 * should never require touching Property, User, Workflow, Report, or Audit
 * modules elsewhere in the app — this interface is the seam.
 */

export interface FieldSpec {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'select' | 'json';
}

export interface DocSpec {
  key: string;
  label: string;
  required: boolean;
}

export interface ReportSectionSpec {
  key: string;
  label: string;
  order: number;
}

export interface CalculationOutcome {
  /** Every intermediate figure, keyed for display/audit — not just the final number. */
  breakdown: Record<string, unknown>;
  results: Array<{
    basis: 'MARKET' | 'FORCED_SALE' | 'INSURANCE' | 'LAND' | 'DEVELOPMENT';
    amount: number;
    method: 'SYSTEM_CALCULATED' | 'VALUER_ADOPTED';
    source?: string;
  }>;
}

export interface ValuationEngine<TInputs = unknown> {
  code: string;
  getRequiredFields(propertyCategory: string): FieldSpec[];
  getRequiredDocuments(propertyCategory: string): DocSpec[];
  getReportSections(): ReportSectionSpec[];
  validateInputs(inputs: TInputs): { valid: boolean; errors: string[] };
  calculate(inputs: TInputs): CalculationOutcome;
}
