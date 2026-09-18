import { calculateSalesComparison } from './sales-comparison.engine';
import { SalesComparisonInputs } from './sales-comparison.types';

describe('SalesComparisonEngine — component-level calculations', () => {
  it('Adjusted price = base price + sum of adjustment amounts', () => {
    const inputs: SalesComparisonInputs = {
      comparables: [{ id: '1', label: 'C1', price: 180000000, included: true, adjustments: [{ factor: 'condition', amount: 2000000, reason: 'test' }, { factor: 'size', amount: -1000000, reason: 'test' }] }],
      valuationDate: '2026-01-01',
    };
    const outcome = calculateSalesComparison(inputs, 1);
    expect((outcome.breakdown.comparableLines as any[])[0].adjustedPrice).toBe(181000000);
  });

  it('Excluded comparables do not affect the indicated value', () => {
    const inputs: SalesComparisonInputs = {
      comparables: [
        { id: '1', label: 'C1', price: 100000000, included: true, adjustments: [] },
        { id: '2', label: 'C2', price: 999000000, included: false, adjustments: [] },
      ],
      valuationDate: '2026-01-01',
    };
    const outcome = calculateSalesComparison(inputs, 1);
    expect(outcome.breakdown.indicatedValue).toBe(100000000);
    expect(outcome.breakdown.includedCount).toBe(1);
  });

  it('Indicated value = mean of adjusted prices across included comparables', () => {
    const inputs: SalesComparisonInputs = {
      comparables: [
        { id: '1', label: 'C1', price: 180000000, included: true, adjustments: [] },
        { id: '2', label: 'C2', price: 210000000, included: true, adjustments: [] },
        { id: '3', label: 'C3', price: 150000000, included: true, adjustments: [] },
      ],
      valuationDate: '2026-01-01',
    };
    const outcome = calculateSalesComparison(inputs, 1);
    expect(outcome.breakdown.indicatedValue).toBe((180000000 + 210000000 + 150000000) / 3);
    const market = outcome.results.find((r) => r.basis === 'MARKET');
    expect(market?.amount).toBe(180000000);
  });

  it('No included comparables → indicated value is 0 and no MARKET result is fabricated from nothing', () => {
    const outcome = calculateSalesComparison({ comparables: [{ id: '1', label: 'C1', price: 100, included: false, adjustments: [] }], valuationDate: '2026-01-01' });
    expect(outcome.breakdown.indicatedValue).toBe(0);
  });

  it('Forced Sale Value only appears when a rule is supplied, and equals indicated value × percentage', () => {
    const inputs: SalesComparisonInputs = {
      comparables: [{ id: '1', label: 'C1', price: 200000000, included: true, adjustments: [] }],
      forcedSaleRule: { percentage: 0.6, ruleCode: 'TEST', ruleVersion: 1 },
      valuationDate: '2026-01-01',
    };
    const outcome = calculateSalesComparison(inputs, 1);
    const fsv = outcome.results.find((r) => r.basis === 'FORCED_SALE');
    expect(fsv?.amount).toBe(120000000);
  });
});

describe('SalesComparisonEngine — reference dataset from the original brief (illustrative fixtures)', () => {
  /**
   * The five illustrative comparables from the project brief. These are
   * examples only — never sufficient training data for a production model,
   * and never hard-coded into the application itself, only used here to
   * prove the averaging mechanics behave as documented.
   */
  it('averages five illustrative comparables into an indicated value', () => {
    const inputs: SalesComparisonInputs = {
      comparables: [
        { id: '1', label: 'Comparable 1 — 500 sqm plot, 180 sqm building', price: 180_000_000, included: true, adjustments: [] },
        { id: '2', label: 'Comparable 2 — 600 sqm plot, 200 sqm building', price: 210_000_000, included: true, adjustments: [] },
        { id: '3', label: 'Comparable 3 — 450 sqm plot, 160 sqm building', price: 150_000_000, included: true, adjustments: [] },
        { id: '4', label: 'Comparable 4 — 700 sqm plot, 240 sqm building', price: 260_000_000, included: true, adjustments: [] },
        { id: '5', label: 'Comparable 5 — 550 sqm plot, 190 sqm building', price: 195_000_000, included: true, adjustments: [] },
      ],
      valuationDate: '2026-01-01',
    };
    const outcome = calculateSalesComparison(inputs, 100000);
    const expectedMean = (180_000_000 + 210_000_000 + 150_000_000 + 260_000_000 + 195_000_000) / 5;
    expect(outcome.breakdown.indicatedValue).toBe(Math.round(expectedMean / 100000) * 100000);
  });
});
