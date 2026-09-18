export interface IncomeUnitInput {
  name: string;          // e.g. "Shop 1", "Apartment 2B"
  unitType: string;      // "residential" | "office" | "retail" | ...
  monthlyRent: number;
  occupancyRate: number; // 0..1 — e.g. 0.9 for 90% occupied/collected over the year
}

export interface OperatingExpenseInput {
  name: string;          // "Maintenance" | "Management" | "Insurance" | "Property tax" | ...
  annualAmount: number;
}

export interface IncomeApproachInputs {
  units: IncomeUnitInput[];
  otherAnnualIncome?: number;
  operatingExpenses: OperatingExpenseInput[];

  adoptedCapRate: number;   // e.g. 0.10 for 10% — valuer-adopted, not a fixed constant
  capRateSource: string;    // e.g. "market evidence" or a rate-table reference

  forcedSaleRule?: { percentage: number; ruleCode: string; ruleVersion: number };
  insuranceValue?: { method: 'VALUER_ADOPTED' | 'SYSTEM_CALCULATED'; amount: number; source: string; justification: string };

  valuationDate: string;
}
