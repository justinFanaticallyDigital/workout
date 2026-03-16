/**
 * Progression calculation utilities for FitTrack Phase 3.
 */

/** Epley formula: estimated 1RM = weight × (1 + reps / 30) */
export function estimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/** Detect progression stall: same weight for N consecutive sessions without rep increase */
export function detectStall(
  sessions: { weight: number; reps: number }[],
  threshold = 3
): boolean {
  if (sessions.length < threshold) return false;
  const recent = sessions.slice(0, threshold);
  const weight = recent[0].weight;
  const maxReps = recent[0].reps;
  return recent.every((s) => s.weight === weight && s.reps <= maxReps);
}

/** Wave progression: returns suggested weight/rep scheme based on cycle position */
export function waveSuggestion(
  baseWeight: number,
  weekInCycle: number
): { weight: number; sets: number; reps: number } {
  // 4-week wave: accumulate → intensify → peak → deload
  const cycle = weekInCycle % 4;
  switch (cycle) {
    case 0: // accumulation
      return { weight: Math.round(baseWeight * 0.75), sets: 3, reps: 10 };
    case 1: // intensify
      return { weight: Math.round(baseWeight * 0.82), sets: 4, reps: 8 };
    case 2: // peak
      return { weight: Math.round(baseWeight * 0.9), sets: 5, reps: 5 };
    case 3: // deload
      return { weight: Math.round(baseWeight * 0.6), sets: 3, reps: 10 };
    default:
      return { weight: baseWeight, sets: 3, reps: 8 };
  }
}

/** RPE-based weight suggestion: adjust weight based on target RPE vs actual RPE */
export function rpeSuggestion(
  lastWeight: number,
  lastRpe: number,
  targetRpe: number
): number {
  // ~2.5% per RPE point
  const rpeDiff = targetRpe - lastRpe;
  const adjustment = rpeDiff * 0.025;
  return Math.round(lastWeight * (1 + adjustment));
}

/** Percentage-based suggestion using estimated 1RM */
export function percentageSuggestion(
  est1rm: number,
  targetPercentage: number
): number {
  return Math.round(est1rm * (targetPercentage / 100));
}

/** Check if deload is recommended based on weeks of training */
export function shouldDeload(
  consecutiveWeeks: number,
  hasStall: boolean
): boolean {
  return consecutiveWeeks >= 5 || hasStall;
}
