import { calculateIncomeApproach } from './income-approach.engine';
import { IncomeApproachInputs } from './income-approach.types';

function minimalInputs(overrides: Partial<IncomeApproachInputs>): IncomeApproachInputs {
  return {
    units: [{ name: 'Unit A', unitType: 'office', monthlyRent: 1000000, occupancyRate: 1 }],
    operatingExpenses: [],
    adoptedCapRate: 0.1,
    capRateSource: 'test',
    valuationDate: '2026-01-01',
    ...overrides,
  };
}

describe('IncomeApproachEngine — component-level calculations', () => {
  it('Gross Potential Income = Σ (monthlyRent × 12) across units', () => {
    const inputs = minimalInputs({
      units: [
        { name: 'A', unitType: 'office', monthlyRent: 500000, occupancyRate: 1 },
        { name: 'B', unitType: 'office', monthlyRent: 300000, occupancyRate: 1 },
      ],
    });
    const outcome = calculateIncomeApproach(inputs, 1);
    expect(outcome.breakdown.grossPotentialIncome).toBe((500000 + 300000) * 12);
  });

  it('Effective Gross Income accounts for occupancy rate plus other income', () => {
    const inputs = minimalInputs({
      units: [{ name: 'A', unitType: 'residential', monthlyRent: 1000000, occupancyRate: 0.9 }],
      otherAnnualIncome: 500000,
    });
    const outcome = calculateIncomeApproach(inputs, 1);
    expect(outcome.breakdown.effectiveGrossIncome).toBe(1000000 * 12 * 0.9 + 500000);
  });

  it('Net Operating Income = Effective Gross Income − Total Operating Expenses', () => {
    const inputs = minimalInputs({
      units: [{ name: 'A', unitType: 'office', monthlyRent: 1000000, occupancyRate: 1 }],
      operatingExpenses: [{ name: 'Maintenance', annualAmount: 800000 }, { name: 'Management', annualAmount: 400000 }],
    });
    const outcome = calculateIncomeApproach(inputs, 1);
    expect(outcome.breakdown.totalOperatingExpenses).toBe(1200000);
    expect(outcome.breakdown.netOperatingIncome).toBe(1000000 * 12 - 1200000);
  });

  it('Indicated Value = NOI ÷ Adopted Capitalization Rate', () => {
    const inputs = minimalInputs({
      units: [{ name: 'A', unitType: 'office', monthlyRent: 1000000, occupancyRate: 1 }],
      operatingExpenses: [],
      adoptedCapRate: 0.1,
    });
    const outcome = calculateIncomeApproach(inputs, 1);
    const noi = outcome.breakdown.netOperatingIncome as number;
    expect(outcome.breakdown.indicatedValue).toBe(noi / 0.1);
    const market = outcome.results.find((r) => r.basis === 'MARKET');
    expect(market?.amount).toBe(noi / 0.1);
  });

  it('A higher cap rate produces a lower indicated value for the same NOI', () => {
    const base = minimalInputs({ adoptedCapRate: 0.08 });
    const higher = minimalInputs({ adoptedCapRate: 0.12 });
    const lowCapOutcome = calculateIncomeApproach(base, 1);
    const highCapOutcome = calculateIncomeApproach(higher, 1);
    expect(highCapOutcome.breakdown.indicatedValue as number).toBeLessThan(lowCapOutcome.breakdown.indicatedValue as number);
  });

  it('Forced Sale Value only appears when a rule is supplied, and equals indicated value × percentage', () => {
    const withoutRule = calculateIncomeApproach(minimalInputs({}));
    expect(withoutRule.results.find((r) => r.basis === 'FORCED_SALE')).toBeUndefined();

    const withRule = calculateIncomeApproach(
      minimalInputs({ forcedSaleRule: { percentage: 0.6, ruleCode: 'TEST', ruleVersion: 1 } }),
      1,
    );
    const indicated = withRule.breakdown.indicatedValue as number;
    const fsv = withRule.results.find((r) => r.basis === 'FORCED_SALE');
    expect(fsv?.amount).toBe(indicated * 0.6);
  });

  it('Zero cap rate does not throw or produce Infinity — falls back to 0', () => {
    const outcome = calculateIncomeApproach(minimalInputs({ adoptedCapRate: 0 }), 1);
    expect(outcome.breakdown.indicatedValue).toBe(0);
    expect(Number.isFinite(outcome.breakdown.indicatedValue as number)).toBe(true);
  });
});
