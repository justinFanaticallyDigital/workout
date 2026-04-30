// src/lib/goal-engine/rate-math.ts
// ============================================================================
// Goal Engine — Rate math helpers.
//
// All functions are pure — no Prisma, no side effects. Browser-safe.
// Spec §8.2 anchors the algorithms.
// ============================================================================

/** R8 — rolling N-day average. Returns NaN for indices with insufficient
 *  data so callers can detect the warm-up period. */
export function rollingAvg(values: number[], window: number): number[] {
  if (window <= 0) return values.slice();
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    if (slice.length === 0) {
      out.push(NaN);
      continue;
    }
    const sum = slice.reduce((acc, v) => acc + v, 0);
    out.push(sum / slice.length);
  }
  return out;
}

/** R8 — linear regression slope (degree-1 polyfit) over (x, y) pairs.
 *  Returns 0 when there are fewer than 2 valid points. */
export function polyfitDeg1(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0 };
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumXX += xs[i] * xs[i];
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/** R8 — weeks between two ISO YYYY-MM-DD dates (positive when end > start). */
export function weeksBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, (end - start) / (7 * 86400000));
}

/** R8 — prescribed weekly rate from start → target over the goal window. */
export function weeklyRate(startValue: number, targetValue: number, startIso: string, targetIso: string): number {
  const w = weeksBetween(startIso, targetIso);
  if (w <= 0) return 0;
  return (targetValue - startValue) / w;
}

/** R8 — actual weekly rate from a rolling-avg series (slope of rolling7
 *  vs. dayIndex, scaled to per-week). */
export function actualWeeklyRate(rolling7: number[]): number {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < rolling7.length; i++) {
    if (Number.isFinite(rolling7[i])) {
      xs.push(i);
      ys.push(rolling7[i]);
    }
  }
  if (xs.length < 2) return 0;
  const { slope } = polyfitDeg1(xs, ys);
  // slope is per-day; scale to per-week.
  return slope * 7;
}

/** R8 — projected hit-target date given an actual weekly rate. Returns
 *  null when rate is 0 or pointing the wrong direction (won't converge). */
export function projectedHitDate(
  currentValue: number,
  targetValue: number,
  ratePerWeek: number,
  fromIso: string,
): string | null {
  const delta = targetValue - currentValue;
  // No movement, or direction mismatch (rate signed wrong).
  if (ratePerWeek === 0) return null;
  if ((delta > 0 && ratePerWeek <= 0) || (delta < 0 && ratePerWeek >= 0)) return null;
  const weeks = delta / ratePerWeek;
  const fromMs = new Date(fromIso).getTime();
  if (!Number.isFinite(fromMs)) return null;
  const projected = new Date(fromMs + weeks * 7 * 86400000);
  return projected.toISOString().slice(0, 10);
}

/**
 * R8 — does the actual trajectory sit ahead of the prescribed line?
 * Direction depends on whether target < start (cutting body weight =
 * lower is ahead) or target > start (gaining strength = higher is ahead).
 */
export function aheadOfPlan(
  currentActual: number,
  currentExpected: number,
  startValue: number,
  targetValue: number,
): boolean {
  if (targetValue < startValue) return currentActual <= currentExpected;
  return currentActual >= currentExpected;
}

/** R8 — drift between actual and expected at the same x (today). */
export function driftFromExpected(currentActual: number, currentExpected: number): number {
  return currentActual - currentExpected;
}

/** R8 — Epley 1RM estimate from weight × reps. */
export function epley1RM(weight: number, reps: number): number {
  if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
