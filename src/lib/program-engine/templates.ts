// src/lib/program-engine/templates.ts
// ============================================================================
// Preset Program Templates
// Pre-configured ProgramConfig objects users can pick and customize.
// ============================================================================

import type { ProgramConfig } from './types';

export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];                // for filtering: ['beginner', 'strength', '3-day']
  config: Partial<ProgramConfig>;
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  // -------------------------------------------------------------------------
  // Beginner
  // -------------------------------------------------------------------------
  {
    id: 'beginner-strength',
    name: 'Starting Strength',
    description: 'Classic 3-day full body linear progression. Master the barbell basics and build a strength foundation.',
    tags: ['beginner', 'strength', '3-day', 'full-body', 'barbell'],
    config: {
      primaryGoal: 'strength',
      durationWeeks: 12,
      daysPerWeek: 3,
      minutesPerSession: 60,
      experience: 'beginner',
      splitPreference: 'full_body',
      equipment: 'full_gym',
      exercisePreference: 'barbell',
      modalities: ['lifting'],
      includeNutrition: false,
    },
  },
  {
    id: 'beginner-muscle',
    name: 'Muscle Foundations',
    description: 'Full body hypertrophy for beginners. Learn the movements, build work capacity, and grow.',
    tags: ['beginner', 'hypertrophy', '3-day', 'full-body', 'mixed'],
    config: {
      primaryGoal: 'hypertrophy',
      durationWeeks: 12,
      daysPerWeek: 3,
      minutesPerSession: 60,
      experience: 'beginner',
      splitPreference: 'full_body',
      equipment: 'full_gym',
      exercisePreference: 'mixed',
      modalities: ['lifting'],
      includeNutrition: false,
    },
  },

  // -------------------------------------------------------------------------
  // Intermediate
  // -------------------------------------------------------------------------
  {
    id: 'ppl-hypertrophy',
    name: 'PPL Hypertrophy',
    description: 'Classic push/pull/legs run twice per week. High volume, high frequency bodybuilding.',
    tags: ['intermediate', 'hypertrophy', '6-day', 'ppl'],
    config: {
      primaryGoal: 'hypertrophy',
      durationWeeks: 12,
      daysPerWeek: 6,
      minutesPerSession: 75,
      experience: 'intermediate',
      splitPreference: 'push_pull_legs',
      equipment: 'full_gym',
      exercisePreference: 'mixed',
      modalities: ['lifting'],
      includeNutrition: false,
    },
  },
  {
    id: 'upper-lower-power',
    name: 'Upper/Lower Power-Building',
    description: '4-day upper/lower split blending strength and hypertrophy. Heavy compounds + targeted accessories.',
    tags: ['intermediate', 'strength', 'hypertrophy', '4-day', 'upper-lower'],
    config: {
      primaryGoal: 'strength',
      secondaryGoal: 'hypertrophy',
      durationWeeks: 8,
      daysPerWeek: 4,
      minutesPerSession: 75,
      experience: 'intermediate',
      splitPreference: 'upper_lower',
      equipment: 'full_gym',
      exercisePreference: 'barbell',
      modalities: ['lifting'],
      includeNutrition: false,
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist Strength',
    description: '2-day full body for the time-crunched. Compounds only, maximum efficiency.',
    tags: ['any-level', 'strength', '2-day', 'full-body', 'efficient'],
    config: {
      primaryGoal: 'strength',
      durationWeeks: 8,
      daysPerWeek: 2,
      minutesPerSession: 45,
      experience: 'intermediate',
      splitPreference: 'full_body',
      equipment: 'full_gym',
      exercisePreference: 'barbell',
      trainingStyles: ['efficiency', 'heavy_compounds'],
      modalities: ['lifting'],
      includeNutrition: false,
    },
  },
  {
    id: 'cut-program',
    name: 'The Cut',
    description: '8-week fat loss program. Maintain strength, manage fatigue, include cardio.',
    tags: ['any-level', 'fat-loss', '4-day', 'upper-lower'],
    config: {
      primaryGoal: 'fat_loss',
      durationWeeks: 8,
      daysPerWeek: 4,
      minutesPerSession: 60,
      experience: 'intermediate',
      splitPreference: 'upper_lower',
      equipment: 'full_gym',
      exercisePreference: 'mixed',
      nutritionContext: 'mild_deficit',
      modalities: ['lifting', 'liss'],
      includeNutrition: true,
      nutritionGoal: 'cut',
    },
  },

  // -------------------------------------------------------------------------
  // Advanced / Competition
  // -------------------------------------------------------------------------
  {
    id: 'powerlifting-meet',
    name: 'Meet Prep (Powerlifting)',
    description: '12-week peaking cycle for a powerlifting meet. Accumulation → Intensification → Peaking.',
    tags: ['advanced', 'powerlifting', '4-day', 'competition'],
    config: {
      primaryGoal: 'powerlifting',
      durationWeeks: 12,
      daysPerWeek: 4,
      minutesPerSession: 90,
      experience: 'advanced',
      splitPreference: 'powerlifting',
      equipment: 'full_gym',
      exercisePreference: 'barbell',
      modalities: ['lifting'],
      includeNutrition: false,
    },
  },
  {
    id: 'bodybuilding-offseason',
    name: 'Bodybuilding Off-Season',
    description: 'High-volume PPL for maximizing muscle growth in a caloric surplus.',
    tags: ['intermediate', 'advanced', 'physique', 'hypertrophy', '6-day', 'ppl'],
    config: {
      primaryGoal: 'physique',
      physiqueDivision: 'bodybuilding',
      prepPhase: 'offseason',
      durationWeeks: 16,
      daysPerWeek: 6,
      minutesPerSession: 90,
      experience: 'advanced',
      splitPreference: 'push_pull_legs',
      equipment: 'full_gym',
      exercisePreference: 'mixed',
      nutritionContext: 'surplus',
      modalities: ['lifting'],
      includeNutrition: true,
      nutritionGoal: 'bulk',
    },
  },
  {
    id: 'bikini-prep',
    name: 'Bikini Prep',
    description: '16-week contest prep. Glute/shoulder emphasis with periodized cardio.',
    tags: ['intermediate', 'advanced', 'physique', 'bikini', '5-day', 'competition'],
    config: {
      primaryGoal: 'physique',
      physiqueDivision: 'bikini',
      prepPhase: 'early_prep',
      durationWeeks: 16,
      daysPerWeek: 5,
      minutesPerSession: 75,
      experience: 'intermediate',
      splitPreference: 'upper_lower',
      equipment: 'full_gym',
      exercisePreference: 'mixed',
      weakPoints: ['glutes', 'shoulders'],
      nutritionContext: 'mild_deficit',
      modalities: ['lifting', 'liss'],
      includeNutrition: true,
      nutritionGoal: 'cut',
    },
  },

  // -------------------------------------------------------------------------
  // Specialty
  // -------------------------------------------------------------------------
  {
    id: 'athletic-performance',
    name: 'Athletic Performance',
    description: '3-day full body for athletes. Explosive movements, power development, injury prevention.',
    tags: ['any-level', 'athletic', '3-day', 'full-body'],
    config: {
      primaryGoal: 'athletic',
      durationWeeks: 8,
      daysPerWeek: 3,
      minutesPerSession: 60,
      experience: 'intermediate',
      splitPreference: 'full_body',
      equipment: 'full_gym',
      exercisePreference: 'barbell',
      modalities: ['lifting', 'hiit'],
      includeNutrition: false,
    },
  },
  {
    id: 'home-dumbbell',
    name: 'Home Dumbbell Program',
    description: 'Full body training with dumbbells only. No gym required.',
    tags: ['any-level', 'general', 'hypertrophy', '3-day', 'home', 'dumbbell'],
    config: {
      primaryGoal: 'general',
      secondaryGoal: 'hypertrophy',
      durationWeeks: 8,
      daysPerWeek: 3,
      minutesPerSession: 45,
      experience: 'intermediate',
      splitPreference: 'full_body',
      equipment: 'dumbbell_only',
      exercisePreference: 'dumbbell',
      modalities: ['lifting', 'stretch'],
      includeNutrition: false,
    },
  },
  {
    id: 'recomp-4day',
    name: 'Body Recomposition',
    description: 'Build muscle and lose fat. Moderate volume, progressive overload, and nutrition awareness.',
    tags: ['intermediate', 'recomp', '4-day', 'upper-lower'],
    config: {
      primaryGoal: 'recomp',
      durationWeeks: 12,
      daysPerWeek: 4,
      minutesPerSession: 60,
      experience: 'intermediate',
      splitPreference: 'upper_lower',
      equipment: 'full_gym',
      exercisePreference: 'mixed',
      nutritionContext: 'maintenance',
      modalities: ['lifting', 'liss'],
      includeNutrition: true,
      nutritionGoal: 'maintain',
    },
  },
];

// ---------------------------------------------------------------------------
// Template Helpers
// ---------------------------------------------------------------------------

export function getTemplateById(id: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((t) => t.id === id);
}

export function filterTemplates(filters: {
  goal?: string;
  days?: number;
  experience?: string;
}): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((t) => {
    if (filters.goal && !t.tags.includes(filters.goal)) return false;
    if (filters.days && !t.tags.includes(`${filters.days}-day`)) return false;
    if (filters.experience && !t.tags.includes(filters.experience) && !t.tags.includes('any-level')) return false;
    return true;
  });
}

/** Merge a template config with user overrides. User values take precedence. */
export function mergeTemplateConfig(
  template: ProgramTemplate,
  overrides: Partial<ProgramConfig>,
): Partial<ProgramConfig> {
  return { ...template.config, ...overrides };
}
