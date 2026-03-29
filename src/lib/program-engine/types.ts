// src/lib/program-engine/types.ts
// ============================================================================
// Program Builder Engine — Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Enums & Literal Types
// ---------------------------------------------------------------------------

export type PrimaryGoal =
  | 'strength'
  | 'hypertrophy'
  | 'fat_loss'
  | 'recomp'
  | 'general'
  | 'powerlifting'
  | 'physique'
  | 'athletic';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export type Split =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'push_pull'
  | 'bro_split'
  | 'powerlifting'
  | 'auto';

export type Equipment =
  | 'full_gym'
  | 'barbell_home'
  | 'dumbbell_only'
  | 'home_minimal'
  | 'bodyweight';

export type ExercisePreference = 'barbell' | 'dumbbell' | 'machine' | 'mixed';

export type Modality = 'lifting' | 'stretch' | 'hiit' | 'liss';

export type PhysiqueDivision =
  | 'bodybuilding'
  | 'classic_physique'
  | 'mens_physique'
  | 'bikini'
  | 'figure'
  | 'wellness';

export type PrepPhase =
  | 'offseason'
  | 'early_prep'
  | 'mid_prep'
  | 'late_prep'
  | 'maintenance';

export type NutritionContext =
  | 'surplus'
  | 'maintenance'
  | 'mild_deficit'
  | 'aggressive_deficit'
  | 'not_tracking';

export type SleepQuality = 'poor' | 'fair' | 'good' | 'great';

export type StressLevel = 'low' | 'moderate' | 'high' | 'physical';

export type TrainingStyle =
  | 'heavy_compounds'
  | 'pump'
  | 'variety'
  | 'efficiency'
  | 'structure'
  | 'flexibility'
  | 'progress_tracking';

export type MovementLimitation =
  | 'overhead'
  | 'deep_squat'
  | 'hip_hinge'
  | 'grip'
  | 'balance';

export type BodyPart =
  | 'neck'
  | 'shoulder_l' | 'shoulder_r'
  | 'elbow_l' | 'elbow_r'
  | 'wrist_l' | 'wrist_r'
  | 'upper_back' | 'lower_back'
  | 'hip_l' | 'hip_r'
  | 'knee_l' | 'knee_r'
  | 'ankle_l' | 'ankle_r';

export type StickingPoint = 'bottom' | 'mid' | 'lockout';

export type CurrentTraining =
  | 'lifting'
  | 'machines'
  | 'bodyweight'
  | 'crossfit'
  | 'classes'
  | 'running_cycling'
  | 'sports'
  | 'yoga_mobility'
  | 'nothing';

// ---------------------------------------------------------------------------
// Movement Pattern Taxonomy
// ---------------------------------------------------------------------------

export type MovementCategory =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'hip_hinge'
  | 'squat'
  | 'lunge'
  | 'carry'
  | 'chest_isolation'
  | 'back_isolation'
  | 'shoulder_isolation'
  | 'bicep'
  | 'tricep'
  | 'quad_isolation'
  | 'hamstring_isolation'
  | 'glute_isolation'
  | 'calf'
  | 'core'
  | 'rotator_cuff'
  | 'cardio'
  | 'stretch';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'biceps'
  | 'triceps'
  | 'calves'
  | 'core'
  | 'forearms'
  | 'traps'
  | 'rear_delts';

export type ExerciseRole =
  | 'primary_compound'
  | 'secondary_compound'
  | 'isolation'
  | 'accessory'
  | 'warmup'
  | 'cardio'
  | 'stretch';

// ---------------------------------------------------------------------------
// Input: ProgramConfig (from questionnaire)
// ---------------------------------------------------------------------------

export interface LiftMax {
  weight: number;
  reps: number;
  unit: 'lbs' | 'kg';
}

export interface ProgramConfig {
  // Step 1: Goals
  primaryGoal: PrimaryGoal;
  secondaryGoal?: PrimaryGoal;
  durationWeeks: 4 | 8 | 12 | 16;
  specificTargets?: string[];

  // Step 1 conditional: Competition
  physiqueDivision?: PhysiqueDivision;      // if primaryGoal = physique
  competitionDate?: string;                  // ISO date, if powerlifting or physique
  sport?: string;                            // if primaryGoal = athletic

  // Step 2: Schedule
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  availableDays?: number[];                  // 0=Mon..6=Sun
  minutesPerSession: 30 | 45 | 60 | 75 | 90;

  // Step 3: Background
  experience: ExperienceLevel;
  currentTraining?: CurrentTraining[];
  splitPreference: Split;

  // Step 4: Equipment
  equipment: Equipment;
  exercisePreference: ExercisePreference;

  // Step 5: Recovery & Lifestyle
  sleepQuality?: SleepQuality;
  stressLevel?: StressLevel;
  nutritionContext?: NutritionContext;

  // Step 6: Injuries & Limitations
  injuries?: BodyPart[];
  movementLimitations?: MovementLimitation[];

  // Step 7: Preferences
  trainingStyles?: TrainingStyle[];
  excludedExercises?: string[];
  modalities: Modality[];

  // Step 8: Benchmarks
  currentMaxes?: {
    squat?: LiftMax;
    bench?: LiftMax;
    deadlift?: LiftMax;
    ohp?: LiftMax;
    row?: LiftMax;
  };
  bodyWeight?: number;
  bodyWeightUnit?: 'lbs' | 'kg';

  // Step 9: Physique-specific
  weakPoints?: MuscleGroup[];               // if primaryGoal = physique
  prepPhase?: PrepPhase;                     // if primaryGoal = physique
  includePosing?: boolean;                   // if primaryGoal = physique

  // Step 10: Powerlifting-specific
  weakestLift?: 'squat' | 'bench' | 'deadlift';
  stickingPoints?: {
    squat?: StickingPoint;
    bench?: StickingPoint;
    deadlift?: StickingPoint;
  };

  // Meta
  includeNutrition: boolean;
  nutritionGoal?: 'bulk' | 'cut' | 'maintain';
}

// ---------------------------------------------------------------------------
// Output: ProgramBlueprint
// ---------------------------------------------------------------------------

export interface ProgramBlueprint {
  name: string;
  description: string;
  durationWeeks: number;
  blocks: BlockBlueprint[];
  nutritionTargets?: NutritionBlueprint;
  metricTargets?: MetricTargetBlueprint[];
  warnings: string[];
  splitSuggestions?: SplitSuggestion[];
}

export interface SplitSuggestion {
  split: Split;
  rank: number;
  reason: string;
  warnings?: string[];
}

export interface BlockBlueprint {
  name: string;
  phase: BlockPhase;
  durationWeeks: number;
  blockNumber: number;
  days: DayBlueprint[];
  volumeModifier: number;       // 1.0 = full, 0.5 = deload, etc.
  intensityModifier: number;    // 1.0 = base, higher = heavier
}

export type BlockPhase =
  | 'accumulation'
  | 'intensification'
  | 'peaking'
  | 'deload'
  | 'prep'         // physique prep
  | 'peak_week';   // physique peak week

export interface DayBlueprint {
  name: string;
  dayNumber: number;
  dayType: 'lifting' | 'cardio' | 'conditioning' | 'mobility' | 'rest';
  slots: CategorySlot[];
}

export interface CategorySlot {
  category: MovementCategory;
  muscleGroups: MuscleGroup[];
  role: ExerciseRole;
  primary: ExerciseAssignment;
  alternatives: ExerciseAssignment[];
  sortOrder: number;
}

export interface ExerciseAssignment {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetRepRange: string;
  targetRpe: string;
  progressionType: ProgressionType;
  progressionIncrement?: number;
  notes?: string;
}

export type ProgressionType =
  | 'linear'
  | 'double'
  | 'wave'
  | 'rpe_based'
  | 'percentage_based'
  | 'none';

export interface NutritionBlueprint {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MetricTargetBlueprint {
  metricKey: string;
  targetValue: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Internal: Intermediate types used between engine stages
// ---------------------------------------------------------------------------

/** Output of ScheduleBuilder — structure without exercises */
export interface ScheduleSkeleton {
  resolvedSplit: Split;
  splitSuggestions: SplitSuggestion[];
  blocks: BlockSkeleton[];
  warnings: string[];
}

export interface BlockSkeleton {
  name: string;
  phase: BlockPhase;
  durationWeeks: number;
  blockNumber: number;
  volumeModifier: number;
  intensityModifier: number;
  days: DaySkeleton[];
}

export interface DaySkeleton {
  name: string;
  dayNumber: number;
  dayType: 'lifting' | 'cardio' | 'conditioning' | 'mobility' | 'rest';
  slotTemplates: SlotTemplate[];
}

/** A slot before exercises are assigned — just the category lane */
export interface SlotTemplate {
  category: MovementCategory;
  muscleGroups: MuscleGroup[];
  role: ExerciseRole;
  sortOrder: number;
  variant?: string;               // hint for selector (e.g., 'incline', 'cable')
  alternatesWith?: MovementCategory; // for full body day-to-day alternation
}

// ---------------------------------------------------------------------------
// Exercise Library Types (for the selector to query against)
// ---------------------------------------------------------------------------

export interface ExerciseRecord {
  id: string;
  name: string;
  movementPattern: string;        // from DB: 'Push', 'Pull', 'Legs', etc.
  primaryMuscle: string;
  secondaryMuscles: string | null;
  equipment: string | null;
  category: string | null;
  isCustom: boolean;
}

/** Enriched exercise with mapped categories for the engine */
export interface MappedExercise extends ExerciseRecord {
  movementCategories: MovementCategory[];
  muscleGroups: MuscleGroup[];
  equipmentType: EquipmentType;
}

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'band'
  | 'kettlebell'
  | 'other';

// ---------------------------------------------------------------------------
// Recovery Modifiers (computed from lifestyle questions)
// ---------------------------------------------------------------------------

export interface RecoveryModifiers {
  volumeMultiplier: number;       // 0.75 - 1.0, applied to weekly volume
  deloadFrequencyWeeks: number;   // 3 or 4 — how often to deload
  maxRpe: number;                 // cap RPE (e.g., 8.5 instead of 9.5 for poor recovery)
  extraDeloads: number;           // additional deloads to insert
}
