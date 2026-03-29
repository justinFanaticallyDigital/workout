// src/lib/program-engine/rules/categories.ts
// ============================================================================
// Movement Pattern Taxonomy & Muscle Group Mappings
// ============================================================================

import type { MovementCategory, MuscleGroup, EquipmentType } from '../types';

// ---------------------------------------------------------------------------
// Category → Muscle Group Mapping
// Which muscles does each movement category primarily train?
// ---------------------------------------------------------------------------

export const CATEGORY_MUSCLES: Record<MovementCategory, MuscleGroup[]> = {
  horizontal_push:     ['chest', 'triceps', 'shoulders'],
  vertical_push:       ['shoulders', 'triceps'],
  horizontal_pull:     ['back', 'biceps', 'rear_delts'],
  vertical_pull:       ['back', 'biceps'],
  hip_hinge:           ['hamstrings', 'glutes', 'back'],
  squat:               ['quads', 'glutes'],
  lunge:               ['quads', 'glutes', 'hamstrings'],
  carry:               ['core', 'traps', 'forearms'],
  chest_isolation:     ['chest'],
  back_isolation:      ['back', 'rear_delts'],
  shoulder_isolation:  ['shoulders', 'rear_delts'],
  bicep:               ['biceps'],
  tricep:              ['triceps'],
  quad_isolation:      ['quads'],
  hamstring_isolation: ['hamstrings'],
  glute_isolation:     ['glutes'],
  calf:                ['calves'],
  core:                ['core'],
  rotator_cuff:        ['shoulders', 'rear_delts'],
  cardio:              [],
  stretch:             [],
};

// ---------------------------------------------------------------------------
// Category Metadata
// ---------------------------------------------------------------------------

export interface CategoryInfo {
  label: string;         // Human-readable display name
  isCompound: boolean;   // Can fill a compound slot?
  isIsolation: boolean;  // Can fill an isolation slot?
  defaultSets: number;   // Base sets for this category
}

export const CATEGORY_INFO: Record<MovementCategory, CategoryInfo> = {
  horizontal_push:     { label: 'Horizontal Push',     isCompound: true,  isIsolation: false, defaultSets: 4 },
  vertical_push:       { label: 'Vertical Push',       isCompound: true,  isIsolation: false, defaultSets: 3 },
  horizontal_pull:     { label: 'Horizontal Pull',     isCompound: true,  isIsolation: false, defaultSets: 4 },
  vertical_pull:       { label: 'Vertical Pull',       isCompound: true,  isIsolation: false, defaultSets: 3 },
  hip_hinge:           { label: 'Hip Hinge',           isCompound: true,  isIsolation: false, defaultSets: 4 },
  squat:               { label: 'Squat',               isCompound: true,  isIsolation: false, defaultSets: 4 },
  lunge:               { label: 'Lunge / Split Squat', isCompound: true,  isIsolation: false, defaultSets: 3 },
  carry:               { label: 'Carry',               isCompound: false, isIsolation: false, defaultSets: 3 },
  chest_isolation:     { label: 'Chest Isolation',     isCompound: false, isIsolation: true,  defaultSets: 3 },
  back_isolation:      { label: 'Back Isolation',      isCompound: false, isIsolation: true,  defaultSets: 3 },
  shoulder_isolation:  { label: 'Shoulder Isolation',  isCompound: false, isIsolation: true,  defaultSets: 3 },
  bicep:               { label: 'Bicep',               isCompound: false, isIsolation: true,  defaultSets: 3 },
  tricep:              { label: 'Tricep',              isCompound: false, isIsolation: true,  defaultSets: 3 },
  quad_isolation:      { label: 'Quad Isolation',      isCompound: false, isIsolation: true,  defaultSets: 3 },
  hamstring_isolation: { label: 'Hamstring Isolation',  isCompound: false, isIsolation: true,  defaultSets: 3 },
  glute_isolation:     { label: 'Glute Isolation',     isCompound: false, isIsolation: true,  defaultSets: 3 },
  calf:                { label: 'Calf',                isCompound: false, isIsolation: true,  defaultSets: 4 },
  core:                { label: 'Core',                isCompound: false, isIsolation: false, defaultSets: 3 },
  rotator_cuff:        { label: 'Rotator Cuff',       isCompound: false, isIsolation: false, defaultSets: 3 },
  cardio:              { label: 'Cardio',              isCompound: false, isIsolation: false, defaultSets: 1 },
  stretch:             { label: 'Stretch',             isCompound: false, isIsolation: false, defaultSets: 1 },
};

// ---------------------------------------------------------------------------
// Injury Body Part → Categories to Avoid/Modify
// ---------------------------------------------------------------------------

export const INJURY_CATEGORY_MAP: Record<string, {
  avoid: MovementCategory[];
  modify: MovementCategory[];   // don't remove, but add notes/substitute
}> = {
  shoulder_l:  { avoid: ['vertical_push'], modify: ['horizontal_push', 'chest_isolation'] },
  shoulder_r:  { avoid: ['vertical_push'], modify: ['horizontal_push', 'chest_isolation'] },
  elbow_l:     { avoid: [], modify: ['bicep', 'tricep', 'horizontal_push'] },
  elbow_r:     { avoid: [], modify: ['bicep', 'tricep', 'horizontal_push'] },
  wrist_l:     { avoid: [], modify: ['horizontal_push', 'vertical_push'] },
  wrist_r:     { avoid: [], modify: ['horizontal_push', 'vertical_push'] },
  lower_back:  { avoid: [], modify: ['hip_hinge', 'squat'] },
  upper_back:  { avoid: [], modify: ['horizontal_pull', 'vertical_pull'] },
  hip_l:       { avoid: [], modify: ['squat', 'lunge', 'hip_hinge'] },
  hip_r:       { avoid: [], modify: ['squat', 'lunge', 'hip_hinge'] },
  knee_l:      { avoid: ['lunge'], modify: ['squat', 'quad_isolation'] },
  knee_r:      { avoid: ['lunge'], modify: ['squat', 'quad_isolation'] },
  ankle_l:     { avoid: [], modify: ['squat', 'lunge', 'calf'] },
  ankle_r:     { avoid: [], modify: ['squat', 'lunge', 'calf'] },
  neck:        { avoid: [], modify: ['vertical_push'] },
};

// ---------------------------------------------------------------------------
// Movement Limitation → Category Substitutions
// ---------------------------------------------------------------------------

export interface LimitationAdjustment {
  avoid: MovementCategory[];
  substitute: { from: MovementCategory; to: MovementCategory }[];
  addCorrective?: MovementCategory;
  notes: string;
}

export const LIMITATION_ADJUSTMENTS: Record<string, LimitationAdjustment> = {
  overhead: {
    avoid: ['vertical_push'],
    substitute: [{ from: 'vertical_push', to: 'horizontal_push' }],
    addCorrective: 'shoulder_isolation',
    notes: 'Landmine press or high-incline press instead of overhead. Add shoulder mobility work to warm-up.',
  },
  deep_squat: {
    avoid: [],
    substitute: [{ from: 'squat', to: 'squat' }], // same category, but selector picks box/goblet
    addCorrective: undefined,
    notes: 'Use box squat, goblet squat, or leg press. Add ankle/hip mobility.',
  },
  hip_hinge: {
    avoid: [],
    substitute: [{ from: 'hip_hinge', to: 'hip_hinge' }],
    notes: 'Trap bar deadlift or rack pulls. Add light RDL as mobility builder.',
  },
  grip: {
    avoid: [],
    substitute: [],
    notes: 'Use straps on heavy pulls. Add grip work (farmer walks, dead hangs) as accessory.',
  },
  balance: {
    avoid: [],
    substitute: [],
    notes: 'Use supported variations for unilateral work (Smith machine, rack-supported). Add tempo work.',
  },
};

// ---------------------------------------------------------------------------
// Physique Division → Muscle Priority Multipliers
// ---------------------------------------------------------------------------

export const PHYSIQUE_MUSCLE_PRIORITY: Record<string, Partial<Record<MuscleGroup, number>>> = {
  bodybuilding: {
    chest: 1.2, back: 1.2, shoulders: 1.2, quads: 1.2, hamstrings: 1.1,
    glutes: 1.0, biceps: 1.1, triceps: 1.1, calves: 1.0, core: 0.8,
  },
  classic_physique: {
    chest: 1.1, back: 1.3, shoulders: 1.3, quads: 1.1, hamstrings: 1.0,
    glutes: 0.9, biceps: 1.1, triceps: 1.1, calves: 1.0, core: 1.0,
  },
  mens_physique: {
    chest: 1.1, back: 1.2, shoulders: 1.4, quads: 0.8, hamstrings: 0.7,
    glutes: 0.7, biceps: 1.2, triceps: 1.2, calves: 0.6, core: 1.0,
  },
  bikini: {
    chest: 0.6, back: 0.8, shoulders: 1.3, quads: 1.0, hamstrings: 1.1,
    glutes: 1.5, biceps: 0.6, triceps: 0.7, calves: 0.7, core: 0.9,
  },
  figure: {
    chest: 0.9, back: 1.2, shoulders: 1.3, quads: 1.1, hamstrings: 1.0,
    glutes: 1.1, biceps: 0.9, triceps: 0.9, calves: 0.9, core: 0.9,
  },
  wellness: {
    chest: 0.7, back: 0.9, shoulders: 1.0, quads: 1.3, hamstrings: 1.2,
    glutes: 1.5, biceps: 0.7, triceps: 0.7, calves: 0.9, core: 0.8,
  },
};

// ---------------------------------------------------------------------------
// Powerlifting Sticking Point → Variation Exercises
// These are exercise name patterns to boost in the selector
// ---------------------------------------------------------------------------

export const STICKING_POINT_VARIATIONS: Record<string, Record<string, string[]>> = {
  squat: {
    bottom:  ['Pause', 'Front Squat', 'Goblet'],
    mid:     ['Belt Squat', 'Tempo', 'Leg Press'],
    lockout: ['Pin Squat', 'Good Morning', 'Hip Thrust'],
  },
  bench: {
    bottom:  ['Pause', 'Wide Grip', 'Fly'],
    mid:     ['Spoto', 'Close Grip', 'Floor Press'],
    lockout: ['Board Press', 'Pin Press', 'Tricep'],
  },
  deadlift: {
    bottom:  ['Deficit', 'Quad', 'Lat Pulldown'],
    mid:     ['Pause Deadlift', 'Romanian', 'Row'],
    lockout: ['Block Pull', 'Rack Pull', 'Hip Thrust'],
  },
};
