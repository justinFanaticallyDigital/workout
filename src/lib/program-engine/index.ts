// src/lib/program-engine/index.ts
// ============================================================================
// Program Builder Engine — Entry Point
//
// generate(config, exercises) → ProgramBlueprint
//
// Stages:
// 1. ScheduleBuilder  → split resolution + block periodization
// 2. CategoryMapper   → slot trimming, injury/limitation adjustments
// 3. ExerciseSelector → fills slots with primary + alternatives
// 4. ProgressionAssigner → rep ranges, RPE, progression types
// ============================================================================

import type {
  ProgramConfig, ProgramBlueprint, ExerciseRecord,
  BlockBlueprint, MappedExercise,
} from './types';
import { buildSchedule } from './schedule-builder';
import { mapCategories } from './category-mapper';
import { selectExercises } from './exercise-selector';
import { assignProgression } from './progression';
import { mapExerciseLibrary } from './rules/exercise-pools';

// Re-export everything consumers need
export type { ProgramConfig, ProgramBlueprint, ExerciseRecord } from './types';
export { PROGRAM_TEMPLATES, getTemplateById, filterTemplates, mergeTemplateConfig } from './templates';
export type { ProgramTemplate } from './templates';

// ---------------------------------------------------------------------------
// Main Generator
// ---------------------------------------------------------------------------

export function generate(
  config: ProgramConfig,
  exercises: ExerciseRecord[],
): ProgramBlueprint {
  const allWarnings: string[] = [];

  // 0. Map exercise library to engine types
  const mappedExercises: MappedExercise[] = mapExerciseLibrary(exercises);

  // 1. Build schedule skeleton (split + blocks + day structure)
  const skeleton = buildSchedule(config);
  allWarnings.push(...skeleton.warnings);

  // 2. Map categories (trim slots, apply injuries/limitations)
  const { skeleton: mappedSkeleton, warnings: mapWarnings } = mapCategories(skeleton, config);
  allWarnings.push(...mapWarnings);

  // 3. Select exercises for each slot
  const { blocks: filledBlocks, warnings: selectWarnings } = selectExercises(
    mappedSkeleton,
    mappedExercises,
    config,
  );
  allWarnings.push(...selectWarnings);

  // 4. Assign progression (rep ranges, RPE, sets, progression type)
  const finalBlocks: BlockBlueprint[] = assignProgression(filledBlocks, config);

  // 5. Generate program name and description
  const { name, description } = generateProgramMeta(config);

  // 6. Generate metric targets
  const metricTargets = generateMetricTargets(config);

  return {
    name,
    description,
    durationWeeks: config.durationWeeks,
    blocks: finalBlocks,
    warnings: allWarnings,
    splitSuggestions: skeleton.splitSuggestions,
    metricTargets,
    nutritionTargets: config.includeNutrition ? generateNutritionTargets(config) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Quick Generate (Path 1 — minimal inputs)
// ---------------------------------------------------------------------------

export function generateQuick(
  partialConfig: {
    primaryGoal: ProgramConfig['primaryGoal'];
    daysPerWeek: ProgramConfig['daysPerWeek'];
    minutesPerSession?: ProgramConfig['minutesPerSession'];
    experience?: ProgramConfig['experience'];
    splitPreference?: ProgramConfig['splitPreference'];
  },
  exercises: ExerciseRecord[],
): ProgramBlueprint {
  const fullConfig: ProgramConfig = {
    // Required from user
    primaryGoal: partialConfig.primaryGoal,
    daysPerWeek: partialConfig.daysPerWeek,

    // Defaults
    durationWeeks: getDefaultDuration(partialConfig.primaryGoal),
    minutesPerSession: partialConfig.minutesPerSession || 60,
    experience: partialConfig.experience || 'intermediate',
    splitPreference: partialConfig.splitPreference || 'auto',
    equipment: 'full_gym',
    exercisePreference: 'mixed',
    modalities: getDefaultModalities(partialConfig.primaryGoal),
    includeNutrition: false,
  };

  return generate(fullConfig, exercises);
}

function getDefaultDuration(goal: ProgramConfig['primaryGoal']): ProgramConfig['durationWeeks'] {
  switch (goal) {
    case 'powerlifting': return 12;
    case 'physique':     return 16;
    case 'fat_loss':     return 8;
    case 'strength':     return 12;
    case 'hypertrophy':  return 12;
    case 'recomp':       return 12;
    case 'athletic':     return 8;
    case 'general':      return 8;
    default:             return 8;
  }
}

function getDefaultModalities(goal: ProgramConfig['primaryGoal']): ProgramConfig['modalities'] {
  switch (goal) {
    case 'fat_loss':  return ['lifting', 'liss'];
    case 'general':   return ['lifting', 'stretch'];
    case 'athletic':  return ['lifting', 'hiit'];
    case 'physique':  return ['lifting', 'liss'];
    default:          return ['lifting'];
  }
}

// ---------------------------------------------------------------------------
// Program Name & Description Generation
// ---------------------------------------------------------------------------

function generateProgramMeta(config: ProgramConfig): { name: string; description: string } {
  const goalNames: Record<string, string> = {
    strength: 'Strength',
    hypertrophy: 'Hypertrophy',
    fat_loss: 'Fat Loss',
    recomp: 'Recomposition',
    general: 'General Fitness',
    powerlifting: 'Powerlifting',
    physique: 'Physique',
    athletic: 'Athletic',
  };

  const splitNames: Record<string, string> = {
    full_body: 'Full Body',
    upper_lower: 'Upper/Lower',
    push_pull_legs: 'PPL',
    push_pull: 'Push/Pull',
    bro_split: 'Body Part Split',
    powerlifting: 'SBD',
    auto: '',
  };

  const goalLabel = goalNames[config.primaryGoal] || config.primaryGoal;
  const splitLabel = splitNames[config.splitPreference] || '';

  const name = splitLabel
    ? `${goalLabel} ${splitLabel} — ${config.daysPerWeek}x/week`
    : `${goalLabel} Program — ${config.daysPerWeek}x/week`;

  const parts: string[] = [
    `${config.durationWeeks}-week ${goalLabel.toLowerCase()} program.`,
    `${config.daysPerWeek} training days per week, ${config.minutesPerSession} minutes per session.`,
  ];

  if (config.secondaryGoal) {
    parts.push(`Secondary focus: ${goalNames[config.secondaryGoal] || config.secondaryGoal}.`);
  }

  if (config.physiqueDivision) {
    parts.push(`Division: ${config.physiqueDivision.replace(/_/g, ' ')}.`);
  }

  return { name, description: parts.join(' ') };
}

// ---------------------------------------------------------------------------
// Metric Target Generation
// ---------------------------------------------------------------------------

function generateMetricTargets(config: ProgramConfig) {
  const targets: { metricKey: string; targetValue: number; unit: string }[] = [];

  // Training frequency target
  targets.push({
    metricKey: 'weekly_sessions',
    targetValue: config.daysPerWeek,
    unit: 'days/week',
  });

  // Body weight target (if provided and relevant)
  if (config.bodyWeight && (config.primaryGoal === 'fat_loss' || config.primaryGoal === 'recomp')) {
    const unit = config.bodyWeightUnit || 'lbs';
    const deficit = config.primaryGoal === 'fat_loss' ? 0.9 : 0.95;
    targets.push({
      metricKey: 'body_weight',
      targetValue: Math.round(config.bodyWeight * deficit),
      unit,
    });
  }

  return targets;
}

// ---------------------------------------------------------------------------
// Nutrition Target Generation (basic)
// ---------------------------------------------------------------------------

function generateNutritionTargets(config: ProgramConfig) {
  if (!config.bodyWeight) return undefined;

  const weightLbs = config.bodyWeightUnit === 'kg'
    ? config.bodyWeight * 2.205
    : config.bodyWeight;

  let calories: number;
  let proteinPerLb: number;

  switch (config.nutritionGoal) {
    case 'bulk':
      calories = Math.round(weightLbs * 18);
      proteinPerLb = 1.0;
      break;
    case 'cut':
      calories = Math.round(weightLbs * 12);
      proteinPerLb = 1.2;
      break;
    case 'maintain':
    default:
      calories = Math.round(weightLbs * 15);
      proteinPerLb = 1.0;
      break;
  }

  const protein = Math.round(weightLbs * proteinPerLb);
  const fatCalories = calories * 0.25;
  const fat = Math.round(fatCalories / 9);
  const carbCalories = calories - (protein * 4) - fatCalories;
  const carbs = Math.round(carbCalories / 4);

  return { calories, protein, carbs, fat };
}
