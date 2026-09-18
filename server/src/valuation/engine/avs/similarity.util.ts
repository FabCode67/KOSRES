export interface PropertyCharacteristics {
  district?: string;
  plotAreaSqm?: number;
  buildingAreaSqm?: number;
  bedrooms?: number;
  ageYears?: number;
  condition?: string;
  cbdDistanceKm?: number;
}

/**
 * Pure similarity scoring — 0 (nothing alike) to 1 (identical on every
 * factor we have data for). Missing data on either side simply excludes
 * that factor from the score rather than penalizing it, so a sparse
 * comparable database still produces usable (if less confident) results.
 *
 * This is intentionally a transparent, explainable weighted-difference
 * score — NOT a trained model. A future ML-based engine can replace this
 * function without touching anything that calls it.
 */
export function scoreSimilarity(subject: PropertyCharacteristics, candidate: PropertyCharacteristics): { score: number; factors: { factor: string; weight: number; contribution: number }[] } {
  const factors: { factor: string; weight: number; contribution: number }[] = [];

  const numericFactor = (name: string, weight: number, a?: number, b?: number, tolerance = 1) => {
    if (a == null || b == null) return;
    const diff = Math.abs(a - b) / Math.max(a, b, tolerance);
    const contribution = Math.max(0, 1 - diff) * weight;
    factors.push({ factor: name, weight, contribution });
  };

  numericFactor('plotAreaSqm', 0.2, subject.plotAreaSqm, candidate.plotAreaSqm, 50);
  numericFactor('buildingAreaSqm', 0.25, subject.buildingAreaSqm, candidate.buildingAreaSqm, 20);
  numericFactor('bedrooms', 0.1, subject.bedrooms, candidate.bedrooms, 1);
  numericFactor('ageYears', 0.1, subject.ageYears, candidate.ageYears, 2);
  numericFactor('cbdDistanceKm', 0.1, subject.cbdDistanceKm, candidate.cbdDistanceKm, 1);

  if (subject.district && candidate.district) {
    factors.push({ factor: 'district', weight: 0.15, contribution: subject.district === candidate.district ? 0.15 : 0 });
  }
  if (subject.condition && candidate.condition) {
    factors.push({ factor: 'condition', weight: 0.1, contribution: subject.condition === candidate.condition ? 0.1 : 0.05 });
  }

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0);
  const score = totalWeight > 0 ? totalContribution / totalWeight : 0;

  return { score: Math.round(score * 100) / 100, factors };
}
