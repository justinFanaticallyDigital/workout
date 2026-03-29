// src/lib/program-engine/progression.ts
// ============================================================================
// Progression Assigner
// Sets rep ranges, RPE, progression type, sets, and increments
// for each exercise based on goal, experience, role, phase, and equipment.
// ============================================================================

import type {
  ProgramConfig, BlockBlueprint, CategorySlot,
  ExerciseAssignment, ExerciseRole, BlockPhase, ProgressionType,
  PrimaryGoal, ExperienceLevel, RecoveryModifiers,
  TrainingStyle,
} from './types';
import { CATEGORY_INFO } from './categories';
import { computeRecoveryModifiers } from './volume';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function assignProgression(
  blocks: BlockBlueprint[],
  config: ProgramConfig,
): BlockBlueprint[] {
  const recovery = computeRecoveryModifiers(
    config.sleepQuality,
    config.stressLevel,
    config.nutritionContext,
  );

  return blocks.map((block) => ({
    ...block,
    days: block.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) =>
        assignSlotProgression(slot, block, config, recovery)
      ),
    })),
  }));
}

// ---------------------------------------------------------------------------
// Slot-Level Progression Assignment
// ---------------------------------------------------------------------------

function assignSlotProgression(
  slot: CategorySlot,
  block: BlockBlueprint,
  config: ProgramConfig,
  recovery: RecoveryModifiers,
): CategorySlot {
  const scheme = getRepScheme(config.primaryGoal, slot.role, block.phase);
  const sets = computeSets(slot, config, block, recovery);
  const progression = getProgressionType(config.experience, slot.role, block.phase, config.trainingStyles);
  const increment = getIncrement(slot, config);

  // Apply to primary
  const primary: ExerciseAssignment = {
    ...slot.primary,
    targetSets: sets,
    targetRepRange: scheme.repRange,
    targetRpe: capRpe(scheme.rpe, recovery.maxRpe),
    progressionType: progression,
    progressionIncrement: increment,
    notes: slot.primary.notes,
  };

  // Apply to alternatives (same scheme, slightly different sets for variation)
  const alternatives = slot.alternatives.map((alt) => ({
    ...alt,
    targetSets: sets,
    targetRepRange: scheme.repRange,
    targetRpe: capRpe(scheme.rpe, recovery.maxRpe),
    progressionType: progression,
    progressionIncrement: increment,
  }));

  return { ...slot, primary, alternatives };
}

// ---------------------------------------------------------------------------
// Rep Schemes by Goal × Role × Phase
// ---------------------------------------------------------------------------

interface RepScheme {
  repRange: string;
  rpe: string;
}

const REP_SCHEMES: Record<PrimaryGoal, Record<ExerciseRole, RepScheme>> = {
  strength: {
    primary_compound:   { repRange: '3-5', rpe: '8-9' },
    secondary_compound: { repRange: '5-8', rpe: '7-8' },
    isolation:          { repRange: '8-12', rpe: '7' },
    accessory:          { repRange: '10-15', rpe: '6-7' },
    warmup:             { repRange: '8-10', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  hypertrophy: {
    primary_compound:   { repRange: '6-10', rpe: '7-8' },
    secondary_compound: { repRange: '8-12', rpe: '7-8' },
    isolation:          { repRange: '12-15', rpe: '8' },
    accessory:          { repRange: '12-20', rpe: '7' },
    warmup:             { repRange: '10-12', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  fat_loss: {
    primary_compound:   { repRange: '8-12', rpe: '7' },
    secondary_compound: { repRange: '10-15', rpe: '7' },
    isolation:          { repRange: '12-20', rpe: '7' },
    accessory:          { repRange: '15-20', rpe: '6-7' },
    warmup:             { repRange: '10-12', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  recomp: {
    primary_compound:   { repRange: '6-8', rpe: '7-8' },
    secondary_compound: { repRange: '8-12', rpe: '7' },
    isolation:          { repRange: '10-15', rpe: '7' },
    accessory:          { repRange: '12-15', rpe: '6-7' },
    warmup:             { repRange: '8-10', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  general: {
    primary_compound:   { repRange: '6-10', rpe: '7' },
    secondary_compound: { repRange: '8-12', rpe: '7' },
    isolation:          { repRange: '10-15', rpe: '7' },
    accessory:          { repRange: '12-15', rpe: '6-7' },
    warmup:             { repRange: '8-10', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  powerlifting: {
    primary_compound:   { repRange: '1-5', rpe: '8-9.5' },
    secondary_compound: { repRange: '5-8', rpe: '7-8' },
    isolation:          { repRange: '8-12', rpe: '6-7' },
    accessory:          { repRange: '10-15', rpe: '6' },
    warmup:             { repRange: '5-8', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  physique: {
    primary_compound:   { repRange: '6-10', rpe: '7-8' },
    secondary_compound: { repRange: '8-12', rpe: '7-8' },
    isolation:          { repRange: '12-15', rpe: '8-9' },
    accessory:          { repRange: '15-20', rpe: '7-8' },
    warmup:             { repRange: '10-12', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
  athletic: {
    primary_compound:   { repRange: '3-6', rpe: '7-8' },
    secondary_compound: { repRange: '6-10', rpe: '7' },
    isolation:          { repRange: '8-12', rpe: '7' },
    accessory:          { repRange: '10-15', rpe: '6-7' },
    warmup:             { repRange: '6-8', rpe: '4-5' },
    cardio:             { repRange: '', rpe: '' },
    stretch:            { repRange: '', rpe: '' },
  },
};

// Phase adjustments to rep ranges
const PHASE_REP_ADJUSTMENTS: Partial<Record<BlockPhase, Partial<Record<ExerciseRole, RepScheme>>>> = {
  peaking: {
    primary_compound:   { repRange: '1-3', rpe: '9-9.5' },
    secondary_compound: { repRange: '3-5', rpe: '8' },
  },
  deload: {
    primary_compound:   { repRange: '5-8', rpe: '5-6' },
    secondary_compound: { repRange: '8-10', rpe: '5-6' },
    isolation:          { repRange: '10-12', rpe: '5-6' },
    accessory:          { repRange: '10-12', rpe: '5' },
  },
  peak_week: {
    primary_compound:   { repRange: '5-8', rpe: '5' },
    secondary_compound: { repRange: '8-10', rpe: '5' },
    isolation:          { repRange: '10-12', rpe: '5' },
    accessory:          { repRange: '10-12', rpe: '4' },
  },
};

function getRepScheme(goal: PrimaryGoal, role: ExerciseRole, phase: BlockPhase): RepScheme {
  // Check for phase override first
  const phaseOverride = PHASE_REP_ADJUSTMENTS[phase]?.[role];
  if (phaseOverride) return phaseOverride;

  return REP_SCHEMES[goal][role] || REP_SCHEMES.general[role];
}

// ---------------------------------------------------------------------------
// Set Count Calculation
// ---------------------------------------------------------------------------

function computeSets(
  slot: CategorySlot,
  config: ProgramConfig,
  block: BlockBlueprint,
  recovery: RecoveryModifiers,
): number {
  const categoryInfo = CATEGORY_INFO[slot.category];
  let baseSets = categoryInfo?.defaultSets || 3;

  // Adjust by role
  if (slot.role === 'primary_compound') baseSets = 4;
  if (slot.role === 'secondary_compound') baseSets = 3;
  if (slot.role === 'isolation') baseSets = 3;
  if (slot.role === 'accessory') baseSets = 3;

  // Apply phase volume modifier
  baseSets = Math.round(baseSets * block.volumeModifier);

  // Apply recovery modifier
  baseSets = Math.round(baseSets * recovery.volumeMultiplier);

  // Physique weak point boost
  if (config.primaryGoal === 'physique' && config.weakPoints) {
    const isWeakPoint = slot.muscleGroups.some((m) => config.weakPoints!.includes(m));
    if (isWeakPoint) {
      baseSets = Math.round(baseSets * 1.3);
    }
  }

  // Training style adjustments
  if (config.trainingStyles?.includes('efficiency')) {
    baseSets = Math.max(2, baseSets - 1);
  }
  if (config.trainingStyles?.includes('pump') && slot.role === 'isolation') {
    baseSets += 1;
  }

  // Clamp
  return Math.max(2, Math.min(6, baseSets));
}

// ---------------------------------------------------------------------------
// Progression Type Assignment
// ---------------------------------------------------------------------------

function getProgressionType(
  experience: ExperienceLevel,
  role: ExerciseRole,
  phase: BlockPhase,
  trainingStyles?: TrainingStyle[],
): ProgressionType {
  // Deload = no progression
  if (phase === 'deload' || phase === 'peak_week') return 'none';

  // Training style overrides
  if (trainingStyles?.includes('structure')) {
    // User wants explicit percentages — use percentage_based for compounds
    if (role === 'primary_compound' || role === 'secondary_compound') {
      return 'percentage_based';
    }
  }
  if (trainingStyles?.includes('flexibility')) {
    // User wants room to improvise — use RPE-based for compounds
    if (role === 'primary_compound' || role === 'secondary_compound') {
      return 'rpe_based';
    }
  }

  // Compounds
  if (role === 'primary_compound' || role === 'secondary_compound') {
    switch (experience) {
      case 'beginner':     return 'linear';
      case 'intermediate': return 'double';
      case 'advanced':     return phase === 'peaking' ? 'percentage_based' : 'wave';
      case 'elite':        return 'percentage_based';
      default:             return 'double';
    }
  }

  // Isolations and accessories always use double progression
  return 'double';
}

// ---------------------------------------------------------------------------
// Progression Increment
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getIncrement(slot: CategorySlot, _config: ProgramConfig): number | undefined {
  // Only relevant for linear and wave progression
  const isCompound = slot.role === 'primary_compound' || slot.role === 'secondary_compound';

  if (!isCompound) return undefined;

  // Determine if upper or lower body based on muscle groups
  const isLower = slot.muscleGroups.some((m) =>
    ['quads', 'hamstrings', 'glutes'].includes(m)
  );

  // Determine equipment type from the primary exercise name (rough heuristic)
  const name = slot.primary.exerciseName.toLowerCase();
  const isDumbbell = name.includes('dumbbell');

  if (isDumbbell) return 5;  // 5 lbs per hand
  if (isLower) return 10;    // 10 lbs for lower body barbell
  return 5;                  // 5 lbs for upper body barbell
}

// ---------------------------------------------------------------------------
// RPE Capping
// ---------------------------------------------------------------------------

function capRpe(rpeString: string, maxRpe: number): string {
  if (!rpeString) return rpeString;

  // Parse RPE ranges like "8-9.5"
  const parts = rpeString.split('-').map((s) => parseFloat(s.trim()));

  if (parts.length === 1) {
    return String(Math.min(parts[0], maxRpe));
  }

  if (parts.length === 2) {
    const capped = parts.map((p) => Math.min(p, maxRpe));
    return `${capped[0]}-${capped[1]}`;
  }

  return rpeString;
}
