import { scoreSimilarity } from './similarity.util';
import { calculateAvs } from './avs.engine';
import { AvsInputs } from './avs.types';

describe('AVS similarity scoring', () => {
  it('identical properties on every scored factor score 1', () => {
    const subject = { district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4, ageYears: 5, condition: 'Good', cbdDistanceKm: 4 };
    const { score } = scoreSimilarity(subject, { ...subject });
    expect(score).toBe(1);
  });

  it('a comparable in a different district scores lower than an identical one in the same district', () => {
    const subject = { district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4 };
    const same = scoreSimilarity(subject, { ...subject, district: 'Kamonyi' });
    const different = scoreSimilarity(subject, { ...subject, district: 'Gasabo' });
    expect(different.score).toBeLessThan(same.score);
  });

  it('missing data on a factor excludes it rather than penalizing the score to zero', () => {
    const { score } = scoreSimilarity({ plotAreaSqm: 500 }, { plotAreaSqm: 500 });
    expect(score).toBe(1); // only one factor had data on both sides, and it matched exactly
  });

  it('a much larger building scores lower similarity on the building-area factor', () => {
    const subject = { buildingAreaSqm: 150 };
    const close = scoreSimilarity(subject, { buildingAreaSqm: 160 });
    const far = scoreSimilarity(subject, { buildingAreaSqm: 400 });
    expect(far.score).toBeLessThan(close.score);
  });
});

describe('AVS engine — component-level calculations', () => {
  function baseInputs(overrides: Partial<AvsInputs>): AvsInputs {
    return {
      subject: { district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4, ageYears: 5, condition: 'Good', cbdDistanceKm: 4 },
      candidates: [],
      valuationDate: '2026-01-01',
      ...overrides,
    };
  }

  it('Indicated value is a similarity-weighted average, not a flat mean — closer matches count for more', () => {
    const inputs = baseInputs({
      candidates: [
        { id: '1', label: 'Very similar', price: 200_000_000, district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4, ageYears: 5, condition: 'Good', cbdDistanceKm: 4 },
        { id: '2', label: 'Less similar', price: 400_000_000, district: 'Gasabo', plotAreaSqm: 900, buildingAreaSqm: 350, bedrooms: 6, ageYears: 20, condition: 'Poor', cbdDistanceKm: 15 },
      ],
      minScore: 0,
    });
    const outcome = calculateAvs(inputs, 1);
    const flatMean = (200_000_000 + 400_000_000) / 2;
    // The very-similar comparable should pull the weighted result well below the flat mean
    expect(outcome.breakdown.indicatedValue as number).toBeLessThan(flatMean);
  });

  it('Only comparables meeting minScore are selected; the rest are recorded as excluded, not dropped silently', () => {
    const inputs = baseInputs({
      candidates: [
        { id: '1', label: 'Match', price: 200_000_000, district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4, ageYears: 5, condition: 'Good', cbdDistanceKm: 4 },
        { id: '2', label: 'No match', price: 900_000_000, district: 'Musanze', plotAreaSqm: 5000, buildingAreaSqm: 2000, bedrooms: 20, ageYears: 80, condition: 'Very poor', cbdDistanceKm: 200 },
      ],
      minScore: 0.5,
    });
    const outcome = calculateAvs(inputs, 1);
    expect((outcome.breakdown.selected as any[]).length).toBe(1);
    expect((outcome.breakdown.excluded as any[]).length).toBe(1);
  });

  it('Fewer than 3 selected comparables produces a low-confidence warning', () => {
    const inputs = baseInputs({
      candidates: [{ id: '1', label: 'Only one', price: 200_000_000, district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180, bedrooms: 4, ageYears: 5, condition: 'Good', cbdDistanceKm: 4 }],
      minScore: 0,
    });
    const outcome = calculateAvs(inputs, 1);
    expect(outcome.breakdown.confidence).toBe('low');
    expect((outcome.breakdown.warnings as string[]).length).toBeGreaterThan(0);
  });

  it('No candidates at all produces indicatedValue 0 rather than throwing', () => {
    const outcome = calculateAvs(baseInputs({ candidates: [] }), 1);
    expect(outcome.breakdown.indicatedValue).toBe(0);
    expect(outcome.breakdown.confidence).toBe('low');
  });

  it('Every AVS result is SYSTEM_CALCULATED — never auto-published as valuer-approved', () => {
    const outcome = calculateAvs(baseInputs({
      candidates: [{ id: '1', label: 'A', price: 200_000_000, district: 'Kamonyi', plotAreaSqm: 500, buildingAreaSqm: 180 }],
      minScore: 0,
    }));
    const market = outcome.results.find((r) => r.basis === 'MARKET');
    expect(market?.method).toBe('SYSTEM_CALCULATED');
  });
});
