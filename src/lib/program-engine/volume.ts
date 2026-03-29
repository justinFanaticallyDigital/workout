// src/lib/program-engine/rules/volume.ts
// ============================================================================
// Volume & Frequency Targets
// ============================================================================

import type {
  MuscleGroup, ExperienceLevel, PrimaryGoal, BlockPhase,
  SleepQuality, StressLevel, NutritionContext, RecoveryModifiers,
} from '../types';

// ---------------------------------------------------------------------------
// Weekly Sets Per Muscle Group (base targets)
// ---------------------------------------------------------------------------

type VolumeRange = { min: number; max: number };

export const WEEKLY_VOLUME: Record<MuscleGroup, Record<ExperienceLevel, VolumeRange>> = {
  chest:      { beginner: { min: 8, max: 10 },  intermediate: { min: 12, max: 16 }, advanced: { min: 16, max: 20 }, elite: { min: 18, max: 24 } },
  back:       { beginner: { min: 8, max: 10 },  intermediate: { min: 12, max: 16 }, advanced: { min: 16, max: 20 }, elite: { min: 18, max: 24 } },
  shoulders:  { beginner: { min: 6, max: 8 },   intermediate: { min: 10, max: 14 }, advanced: { min: 14, max: 18 }, elite: { min: 16, max: 22 } },
  quads:      { beginner: { min: 8, max: 10 },  intermediate: { min: 12, max: 16 }, advanced: { min: 16, max: 20 }, elite: { min: 18, max: 24 } },
  hamstrings: { beginner: { min: 6, max: 8 },   intermediate: { min: 10, max: 12 }, advanced: { min: 12, max: 16 }, elite: { min: 14, max: 18 } },
  glutes:     { beginner: { min: 4, max: 6 },   intermediate: { min: 8, max: 10 },  advanced: { min: 10, max: 14 }, elite: { min: 12, max: 16 } },
  biceps:     { beginner: { min: 4, max: 6 },   intermediate: { min: 8, max: 12 },  advanced: { min: 12, max: 16 }, elite: { min: 14, max: 18 } },
  triceps:    { beginner: { min: 4, max: 6 },   intermediate: { min: 8, max: 12 },  advanced: { min: 12, max: 16 }, elite: { min: 14, max: 18 } },
  calves:     { beginner: { min: 4, max: 6 },   intermediate: { min: 6, max: 8 },   advanced: { min: 8, max: 12 },  elite: { min: 10, max: 14 } },
  core:       { beginner: { min: 4, max: 6 },   intermediate: { min: 6, max: 10 },  advanced: { min: 8, max: 12 },  elite: { min: 10, max: 14 } },
  forearms:   { beginner: { min: 0, max: 2 },   intermediate: { min: 2, max: 4 },   advanced: { min: 4, max: 6 },   elite: { min: 4, max: 8 } },
  traps:      { beginner: { min: 2, max: 4 },   intermediate: { min: 4, max: 6 },   advanced: { min: 6, max: 8 },   elite: { min: 6, max: 10 } },
  rear_delts: { beginner: { min: 2, max: 4 },   intermediate: { min: 4, max: 8 },   advanced: { min: 8, max: 10 },  elite: { min: 8, max: 12 } },
};

// ---------------------------------------------------------------------------
// Phase Volume & Intensity Modifiers
// ---------------------------------------------------------------------------

export const PHASE_MODIFIERS: Record<BlockPhase, { volume: number; intensity: number }> = {
  accumulation:    { volume: 1.0,  intensity: 0.75 },   // high volume, moderate intensity
  intensification: { volume: 0.80, intensity: 0.88 },   // reduced volume, higher intensity
  peaking:         { volume: 0.60, intensity: 1.0 },    // low volume, highest intensity
  deload:          { volume: 0.50, intensity: 0.60 },   // half volume, easy intensity
  prep:            { volume: 0.85, intensity: 0.80 },   // physique prep: maintain volume, moderate intensity
  peak_week:       { volume: 0.40, intensity: 0.50 },   // physique peak: minimal stimulation
};

// ---------------------------------------------------------------------------
// Goal → Volume Bias
// Adjusts which end of the volume range to target
// ---------------------------------------------------------------------------

export const GOAL_VOLUME_BIAS: Record<PrimaryGoal, number> = {
  hypertrophy: 1.0,    // use max of range
  physique:    1.0,
  strength:    0.6,    // use 60% of range (lower volume, higher intensity)
  powerlifting: 0.5,
  fat_loss:    0.7,    // moderate volume
  recomp:      0.7,
  general:     0.6,
  athletic:    0.5,
};

// ---------------------------------------------------------------------------
// Recovery Modifiers (from lifestyle questions)
// ---------------------------------------------------------------------------

const SLEEP_MODIFIERS: Record<SleepQuality, { volume: number; deloadWeeks: number; maxRpe: number }> = {
  poor:  { volume: 0.80, deloadWeeks: 3, maxRpe: 8.0 },
  fair:  { volume: 0.90, deloadWeeks: 3, maxRpe: 8.5 },
  good:  { volume: 1.00, deloadWeeks: 4, maxRpe: 9.5 },
  great: { volume: 1.05, deloadWeeks: 4, maxRpe: 10.0 },
};

const STRESS_MODIFIERS: Record<StressLevel, number> = {
  low:      1.05,
  moderate: 1.00,
  high:     0.85,
  physical: 0.80,
};

const NUTRITION_VOLUME_MODIFIERS: Record<NutritionContext, number> = {
  surplus:            1.10,
  maintenance:        1.00,
  mild_deficit:       0.88,
  aggressive_deficit: 0.75,
  not_tracking:       1.00,  // assume maintenance
};

export function computeRecoveryModifiers(
  sleep: SleepQuality = 'good',
  stress: StressLevel = 'moderate',
  nutrition: NutritionContext = 'not_tracking',
): RecoveryModifiers {
  const sleepMod = SLEEP_MODIFIERS[sleep];
  const stressMod = STRESS_MODIFIERS[stress];
  const nutritionMod = NUTRITION_VOLUME_MODIFIERS[nutrition];

  // Combine multiplicatively, clamp to reasonable range
  const rawVolume = sleepMod.volume * stressMod * nutritionMod;
  const volumeMultiplier = Math.max(0.60, Math.min(1.15, rawVolume));

  return {
    volumeMultiplier,
    deloadFrequencyWeeks: sleepMod.deloadWeeks,
    maxRpe: sleepMod.maxRpe,
    extraDeloads: rawVolume < 0.75 ? 1 : 0,
  };
}

// ---------------------------------------------------------------------------
// Compute Actual Weekly Volume Targets
// ---------------------------------------------------------------------------

export function getWeeklyVolume(
  muscle: MuscleGroup,
  experience: ExperienceLevel,
  goal: PrimaryGoal,
  recoveryMods: RecoveryModifiers,
  weakPointMultiplier: number = 1.0,
): number {
  const range = WEEKLY_VOLUME[muscle][experience];
  const bias = GOAL_VOLUME_BIAS[goal];

  // Interpolate within the range based on goal bias
  const baseVolume = range.min + (range.max - range.min) * bias;

  // Apply recovery and weak point modifiers
  const adjusted = baseVolume * recoveryMods.volumeMultiplier * weakPointMultiplier;

  // Round to nearest whole set, minimum 2
  return Math.max(2, Math.round(adjusted));
}

// ---------------------------------------------------------------------------
// Session Time Budget
// ---------------------------------------------------------------------------

export interface TimeBudget {
  maxCompounds: number;
  maxIsolations: number;
  maxAccessories: number;
  totalSlots: number;
}

export const TIME_BUDGETS: Record<number, TimeBudget> = {
  30: { maxCompounds: 2, maxIsolations: 1, maxAccessories: 0, totalSlots: 3 },
  45: { maxCompounds: 2, maxIsolations: 2, maxAccessories: 1, totalSlots: 5 },
  60: { maxCompounds: 3, maxIsolations: 3, maxAccessories: 1, totalSlots: 7 },
  75: { maxCompounds: 3, maxIsolations: 3, maxAccessories: 2, totalSlots: 8 },
  90: { maxCompounds: 3, maxIsolations: 4, maxAccessories: 3, totalSlots: 10 },
};

export function getTimeBudget(minutes: number): TimeBudget {
  return TIME_BUDGETS[minutes] || TIME_BUDGETS[60];
}
