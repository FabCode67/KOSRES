import { calculateCostApproach } from './cost-approach.engine';
import { CostApproachInputs } from './cost-approach.types';

describe('CostApproachEngine — component-level calculations', () => {
  it('Land Value = landAreaSqm × adoptedLandRatePerSqm', () => {
    const inputs = minimalInputs({ landAreaSqm: 500, adoptedLandRatePerSqm: 20000 });
    const outcome = calculateCostApproach(inputs);
    expect(outcome.breakdown.land).toMatchObject({ value: 500 * 20000 });
  });

  it('Building replacement cost = componentArea × unitRate, per component', () => {
    const inputs = minimalInputs({
      buildingComponents: [
        { name: 'Main house', areaSqm: 100, adoptedRatePerSqm: 200000 },
        { name: 'Annex', areaSqm: 20, adoptedRatePerSqm: 100000 },
      ],
    });
    const outcome = calculateCostApproach(inputs);
    expect(outcome.breakdown.buildingLines).toEqual([
      { name: 'Main house', areaSqm: 100, ratePerSqm: 200000, replacementCost: 20000000 },
      { name: 'Annex', areaSqm: 20, ratePerSqm: 100000, replacementCost: 2000000 },
    ]);
    expect(outcome.breakdown.buildingSubtotal).toBe(22000000);
  });

  it('External work cost = quantity × adoptedRate for each unit type', () => {
    const inputs = minimalInputs({
      externalWorks: [
        { name: 'Fence', unit: 'LINEAR_M', quantity: 50, adoptedRate: 55000 },
        { name: 'Gate', unit: 'ITEM', quantity: 1, adoptedRate: 900000 },
      ],
    });
    const outcome = calculateCostApproach(inputs);
    expect(outcome.breakdown.externalWorksSubtotal).toBe(50 * 55000 + 1 * 900000);
  });

  it('Depreciation amount = totalDevelopmentCost × depreciationRate', () => {
    const inputs = minimalInputs({
      buildingComponents: [{ name: 'House', areaSqm: 100, adoptedRatePerSqm: 100000 }],
      depreciationRule: { method: 'FLAT_RATE', rate: 0.1, ruleCode: 'TEST', ruleVersion: 1 },
    });
    const outcome = calculateCostApproach(inputs);
    expect(outcome.breakdown.depreciation).toMatchObject({ amount: 1000000 });
    expect(outcome.breakdown.depreciatedReplacementCost).toBe(9000000);
  });

  it("Development Value = Depreciated Replacement Cost + Developer's Profit", () => {
    const inputs = minimalInputs({
      buildingComponents: [{ name: 'House', areaSqm: 100, adoptedRatePerSqm: 100000 }],
      depreciationRule: { method: 'FLAT_RATE', rate: 0, ruleCode: 'TEST', ruleVersion: 1 },
      developerProfitRule: { rate: 0.1, completionPercentage: 1, ruleCode: 'TEST', ruleVersion: 1 },
    });
    const outcome = calculateCostApproach(inputs, 1);
    expect(outcome.breakdown.developerProfit).toMatchObject({ amount: 1000000 });
    expect(outcome.breakdown.developmentValue).toBe(11000000);
  });

  it('Open Market Value = Land Value + Development Value', () => {
    const inputs = minimalInputs({
      landAreaSqm: 100, adoptedLandRatePerSqm: 10000,
      buildingComponents: [{ name: 'House', areaSqm: 100, adoptedRatePerSqm: 100000 }],
      depreciationRule: { method: 'FLAT_RATE', rate: 0, ruleCode: 'TEST', ruleVersion: 1 },
      developerProfitRule: { rate: 0, completionPercentage: 1, ruleCode: 'TEST', ruleVersion: 1 },
    });
    const outcome = calculateCostApproach(inputs, 1);
    expect(outcome.breakdown.openMarketValue).toBe(11000000);
    const market = outcome.results.find((r) => r.basis === 'MARKET');
    expect(market?.amount).toBe(11000000);
  });

  it('Forced Sale Value is only produced when a forcedSaleRule is supplied, and equals OMV × percentage', () => {
    const withoutRule = calculateCostApproach(minimalInputs({}));
    expect(withoutRule.results.find((r) => r.basis === 'FORCED_SALE')).toBeUndefined();

    const withRule = calculateCostApproach(
      minimalInputs({ forcedSaleRule: { percentage: 0.5, ruleCode: 'TEST_FSV', ruleVersion: 1 } }),
      1,
    );
    const omv = withRule.breakdown.openMarketValue as number;
    const fsv = withRule.results.find((r) => r.basis === 'FORCED_SALE');
    expect(fsv?.amount).toBe(omv * 0.5);
  });

  it('Insurance Value is passed through as VALUER_ADOPTED and is never auto-derived from OMV', () => {
    const outcome = calculateCostApproach(
      minimalInputs({
        insuranceValue: { method: 'VALUER_ADOPTED', amount: 42000000, source: 'valuer professional judgement', justification: 'Replacement cost of insurable structures only' },
      }),
    );
    const insurance = outcome.results.find((r) => r.basis === 'INSURANCE');
    expect(insurance).toMatchObject({ amount: 42000000, method: 'VALUER_ADOPTED', source: 'valuer professional judgement' });
  });
});

describe('CostApproachEngine — reference valuation reproduction (test fixture, not an app constant)', () => {
  /**
   * These figures come from a real KOSRES valuation report (Plot No.14181,
   * Kamonyi District, valuation date 27 Aug 2026). They exist ONLY as a test
   * fixture to prove the engine reproduces a known professional result when
   * given the exact same inputs/rates/rules — never hard-code these numbers
   * into the application itself.
   */
  it("reproduces the reference report's Open Market, Forced Sale, and component values", () => {
    const referenceInputs: CostApproachInputs = {
      landAreaSqm: 567,
      adoptedLandRatePerSqm: 25000,
      landRateSource: 'reference-fixture',

      buildingComponents: [
        { name: 'Main house', areaSqm: 158.12, adoptedRatePerSqm: 240000 },
        { name: 'Annex house I', areaSqm: 8.91, adoptedRatePerSqm: 150000 },
        { name: 'Annex house II', areaSqm: 27.3, adoptedRatePerSqm: 30000 },
      ],

      externalWorks: [
        { name: 'Site leveling', unit: 'LUMP_SUM', quantity: 1, adoptedRate: 1200000 },
        { name: 'Retaining wall', unit: 'SQM', quantity: 44.66, adoptedRate: 85000 },
        { name: 'Fence', unit: 'LINEAR_M', quantity: 67.5, adoptedRate: 55000 },
        { name: 'Main entrance gate', unit: 'ITEM', quantity: 1, adoptedRate: 900000 },
        { name: 'Parking shed', unit: 'LUMP_SUM', quantity: 1, adoptedRate: 1500000 },
        { name: 'Paved area', unit: 'SQM', quantity: 142.56, adoptedRate: 18000 },
        { name: 'Parking in pavers', unit: 'SQM', quantity: 10.72, adoptedRate: 25000 },
        { name: 'Water tanks', unit: 'ITEM', quantity: 2, adoptedRate: 500000 },
        { name: 'Foul drainage system', unit: 'LUMP_SUM', quantity: 1, adoptedRate: 1500000 },
      ],

      depreciationRule: { method: 'FLAT_RATE', rate: 0.07, ruleCode: 'DEPRECIATION_FLAT_STANDARD', ruleVersion: 1 },
      developerProfitRule: { rate: 0.12, completionPercentage: 1, ruleCode: 'DEVELOPER_PROFIT_STANDARD', ruleVersion: 1 },
      forcedSaleRule: { percentage: 0.6, ruleCode: 'FORCED_SALE_STANDARD', ruleVersion: 1 },

      valuationDate: '2026-08-27',
    };

    const outcome = calculateCostApproach(referenceInputs, 100000);

    expect(outcome.breakdown.land).toMatchObject({ value: 14200000 });
    expect(outcome.breakdown.buildingSubtotal).toBeCloseTo(40104300, 0);
    expect(outcome.breakdown.externalWorksSubtotal).toBeCloseTo(16442680, 0);
    expect(outcome.breakdown.totalDevelopmentCost).toBeCloseTo(56546980, 0);
    expect(outcome.breakdown.developmentValue).toBe(58900000);
    expect(outcome.breakdown.openMarketValue).toBe(73100000);

    const market = outcome.results.find((r) => r.basis === 'MARKET');
    const forcedSale = outcome.results.find((r) => r.basis === 'FORCED_SALE');
    expect(market?.amount).toBe(73100000);
    expect(forcedSale?.amount).toBe(43900000);
  });
});

function minimalInputs(overrides: Partial<CostApproachInputs>): CostApproachInputs {
  return {
    landAreaSqm: 100,
    adoptedLandRatePerSqm: 10000,
    landRateSource: 'test',
    buildingComponents: [{ name: 'House', areaSqm: 100, adoptedRatePerSqm: 100000 }],
    externalWorks: [],
    depreciationRule: { method: 'FLAT_RATE', rate: 0.07, ruleCode: 'TEST', ruleVersion: 1 },
    developerProfitRule: { rate: 0.12, completionPercentage: 1, ruleCode: 'TEST', ruleVersion: 1 },
    valuationDate: '2026-01-01',
    ...overrides,
  };
}
