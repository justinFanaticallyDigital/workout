# Program Builder Engine — Technical Specification

## Overview

A deterministic, rule-based TypeScript engine that generates structured workout programs from user inputs. No API calls — all logic is local. The engine produces a complete Program → Block → BlockDay → BlockDayExercise hierarchy that drops directly into the existing visual builder for review and editing.

---

## Architecture

```
User Inputs (questionnaire)
        ↓
┌─────────────────────┐
│  ProgramGenerator    │  ← Entry point
│  generate(config)    │
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  ScheduleBuilder     │  ← Suggests split, days/week, block phases
│  buildSchedule()     │     (user can override split suggestion)
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  CategoryMapper      │  ← NEW: Assigns movement pattern categories to each slot
│  mapCategories()     │     per day (e.g., "Horizontal Push", "Hip Hinge")
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  ExerciseSelector    │  ← Fills each category slot with primary exercise +
│  selectExercises()   │     alternatives from the same category
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  ProgressionAssigner │  ← Sets rep ranges, RPE, progression type per exercise
│  assignProgression() │
└────────┬────────────┘
         ↓
  ProgramBlueprint (JSON)
        ↓
  POST /api/programs/generate → creates all DB records
        ↓
  Redirect to /programs/[id] (existing inline editor)
  User sees exercises grouped by category lane — can swap within lane
```

### File Location

```
src/lib/program-engine/
├── index.ts              # Public API: generate()
├── types.ts              # All input/output types
├── schedule-builder.ts   # Split suggestion + block structure logic
├── category-mapper.ts    # NEW: Movement pattern → category slot assignment
├── exercise-selector.ts  # Exercise picking within categories
├── progression.ts        # Rep schemes, RPE, progression types
├── templates.ts          # Preset program templates
└── rules/
    ├── splits.ts         # Split definitions (FB, UL, PPL, etc.)
    ├── categories.ts     # NEW: Movement pattern taxonomy + muscle group mappings
    ├── volume.ts         # Volume & frequency targets by goal/level
    └── exercise-pools.ts # Exercise categorization for slot filling
```

---

## Input Schema

```typescript
// src/lib/program-engine/types.ts

export type PrimaryGoal =
  | 'strength'      // maximize 1RM on compounds
  | 'hypertrophy'   // maximize muscle growth
  | 'fat_loss'      // maintain muscle, caloric deficit
  | 'recomp'        // simultaneous gain/lose
  | 'general'       // balanced fitness
  | 'powerlifting'  // meet prep (SBD focus)
  | 'athletic';     // sport performance

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Split =
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'push_pull'     // 2-day push/pull (no dedicated leg day)
  | 'bro_split'     // chest/back/shoulders/arms/legs
  | 'auto';         // engine decides based on frequency + goal

export type Equipment =
  | 'full_gym'      // barbell, dumbbells, cables, machines
  | 'barbell_focus'  // barbell + rack + bench, limited machines
  | 'dumbbell_only'
  | 'home_minimal'  // dumbbells + bands + bodyweight
  | 'bodyweight';

export type ExercisePreference = 'barbell' | 'dumbbell' | 'machine' | 'mixed';

export type Modality = 'lifting' | 'stretch' | 'hiit' | 'liss';

export interface ProgramConfig {
  // Step 1: Goals
  primaryGoal: PrimaryGoal;
  secondaryGoal?: PrimaryGoal;
  durationWeeks: 4 | 8 | 12 | 16;
  specificTargets?: string[];  // freeform: "bench 225", "lose 15lbs"

  // Step 2: Background
  experience: ExperienceLevel;
  currentFrequency: number;       // 0-7 days/week currently training
  injuries?: string[];            // body parts to avoid

  // Step 3: Schedule
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  availableDays?: number[];       // 0=Mon..6=Sun, optional
  minutesPerSession: 30 | 45 | 60 | 75 | 90;
  equipment: Equipment;

  // Step 4: Preferences
  modalities: Modality[];         // must include 'lifting'
  splitPreference: Split;
  exercisePreference: ExercisePreference;
  excludedExercises?: string[];   // exercise IDs to never include

  // Step 5: Nutrition (optional)
  includeNutrition: boolean;
  nutritionGoal?: 'bulk' | 'cut' | 'maintain';
}
```

---

## Output Schema (Blueprint)

```typescript
export interface ProgramBlueprint {
  name: string;
  description: string;
  durationWeeks: number;
  blocks: BlockBlueprint[];
  nutritionTargets?: NutritionBlueprint;
  metricTargets?: MetricTargetBlueprint[];
  warnings?: string[];          // soft warnings: split suggestions, injury subs, etc.
  splitSuggestions?: SplitSuggestion[];  // ranked split options when auto
}

export interface SplitSuggestion {
  split: Split;
  rank: number;
  reason: string;               // "Best frequency match for 4 days + hypertrophy goal"
  warnings?: string[];          // "Lower frequency per muscle than upper/lower"
}

export interface BlockBlueprint {
  name: string;
  phase: string;              // 'accumulation', 'intensification', 'peaking', 'deload'
  durationWeeks: number;
  blockNumber: number;
  days: DayBlueprint[];
}

export interface DayBlueprint {
  name: string;
  dayNumber: number;          // 1-indexed within block
  dayType: 'lifting' | 'cardio' | 'conditioning' | 'mobility' | 'rest';
  slots: CategorySlot[];      // exercises grouped by movement category
}

// NEW: Each slot represents a movement category lane on a given day
export interface CategorySlot {
  category: MovementCategory;       // the movement pattern this slot fills
  muscleGroups: MuscleGroup[];      // secondary filter: which muscles this targets
  role: ExerciseRole;               // compound vs isolation vs accessory
  primary: ExerciseAssignment;      // engine-selected primary exercise
  alternatives: ExerciseAssignment[]; // 1-3 swappable alternatives in same category
  sortOrder: number;
}

export interface ExerciseAssignment {
  exerciseId: string;         // references seeded exercise library
  exerciseName: string;       // denormalized for display
  targetSets: number;
  targetRepRange: string;     // "3-5", "8-12", "12-15"
  targetRpe: string;          // "7", "8-9", "RPE 6"
  progressionType: 'linear' | 'double' | 'wave' | 'rpe_based' | 'percentage_based' | 'none';
  progressionIncrement?: number;
  notes?: string;
}

// Movement pattern taxonomy — the primary lens for categorization
export type MovementCategory =
  | 'horizontal_push'    // bench press, push-up, chest press
  | 'vertical_push'      // OHP, pike push-up, shoulder press
  | 'horizontal_pull'    // barbell row, cable row, dumbbell row
  | 'vertical_pull'      // pull-up, lat pulldown, chin-up
  | 'hip_hinge'          // deadlift, RDL, good morning
  | 'squat'              // back squat, front squat, goblet squat
  | 'lunge'              // lunges, split squats, step-ups
  | 'carry'              // farmer's walk, suitcase carry
  | 'chest_isolation'    // fly, cable crossover, pec deck
  | 'back_isolation'     // straight-arm pulldown, reverse fly
  | 'shoulder_isolation' // lateral raise, front raise, face pull
  | 'bicep'              // curl variations
  | 'tricep'             // extension, pushdown, skull crusher
  | 'quad_isolation'     // leg extension
  | 'hamstring_isolation'// leg curl
  | 'glute_isolation'    // hip thrust, glute bridge, kickback
  | 'calf'               // calf raise variations
  | 'core'               // plank, crunch, ab wheel, pallof press
  | 'rotator_cuff'       // internal/external rotation, face pull
  | 'cardio'             // HIIT or LISS movements
  | 'stretch';           // mobility work

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'quads' | 'hamstrings'
  | 'glutes' | 'biceps' | 'triceps' | 'calves' | 'core'
  | 'forearms' | 'traps' | 'rear_delts';

export type ExerciseRole =
  | 'primary_compound'   // squat, bench, deadlift, OHP
  | 'secondary_compound' // rows, lunges, RDL, incline press
  | 'isolation'          // curls, laterals, extensions
  | 'accessory'          // face pulls, abs, calves
  | 'warmup'             // light activation movements
  | 'cardio'             // HIIT or LISS movements
  | 'stretch';           // mobility work

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
```

---

## Engine Rules

### 1. Split Resolution (`schedule-builder.ts`)

The engine **suggests** splits ranked by suitability — the user always has final say. When `splitPreference` is `'auto'`, the engine returns a ranked list of 2-3 options. When the user picks a specific split, the engine validates it's feasible for the frequency and warns (but doesn't block) if it's suboptimal.

**Suggestion ranking by frequency:**

| Days/Week | Ranked Suggestions (best → acceptable) |
|-----------|---------------------------------------|
| 2 | Full Body, Upper/Lower, Push/Pull |
| 3 | Full Body, PPL, Upper/Lower + 1 |
| 4 | Upper/Lower, PPL + 1, Full Body x4 |
| 5 | PPL + UL, Upper/Lower x2 + 1, Bro Split |
| 6 | PPL x2, Upper/Lower x3, Bro Split + 1 |

**Goal biases** (shift ranking, don't eliminate options):
- `powerlifting` → boost SBD-focused splits to top
- `fat_loss` → boost higher-frequency-per-muscle splits (full body, U/L)
- `hypertrophy` → boost higher-volume splits (PPL, bro split)
- `strength` → boost compound-focused splits (U/L, full body)

**Validation warnings** (shown to user, not blocking):
- 2 days/week + PPL → "PPL works best with 3+ days. You'll only hit each pattern once every ~10 days. Consider Upper/Lower for more balanced frequency."
- 6 days/week + Full Body → "Full body 6x/week is very high fatigue. Consider PPL for better recovery between sessions."
- Beginner + Bro Split → "Bro splits work, but beginners often progress faster with higher frequency per muscle. Full body or upper/lower are worth considering."

The key principle: **any split can work at any level.** The engine optimizes, the user decides.

### 2. Block Periodization (`schedule-builder.ts`)

| Duration | Block Structure |
|----------|----------------|
| 4 weeks | 3 weeks training + 1 deload |
| 8 weeks | 4 accumulation + 3 intensification + 1 deload |
| 12 weeks | 4 accum + 4 intensification + 3 peaking + 1 deload |
| 16 weeks | 5 accum + 5 intensification + 4 peaking + 2 deload (mid + end) |

Goal modifiers:
- `hypertrophy` → longer accumulation phases (higher volume)
- `strength/powerlifting` → longer intensification/peaking (heavier loads)
- `fat_loss` → no peaking block, maintain volume, shorter blocks
- `general` → even distribution

### 3. Volume Targets (`rules/volume.ts`)

Weekly sets per muscle group (across all days):

| Muscle Group | Beginner | Intermediate | Advanced |
|--------------|----------|--------------|----------|
| Chest | 8-10 | 12-16 | 16-20 |
| Back | 8-10 | 12-16 | 16-20 |
| Shoulders | 6-8 | 10-14 | 14-18 |
| Quads | 8-10 | 12-16 | 16-20 |
| Hamstrings | 6-8 | 10-12 | 12-16 |
| Biceps | 4-6 | 8-12 | 12-16 |
| Triceps | 4-6 | 8-12 | 12-16 |
| Glutes | 4-6 | 8-10 | 10-14 |
| Calves | 4-6 | 6-8 | 8-12 |
| Abs/Core | 4-6 | 6-10 | 8-12 |

Phase modifiers:
- **Accumulation**: 100% of target volume, moderate intensity
- **Intensification**: 80% volume, higher intensity
- **Peaking**: 60% volume, highest intensity
- **Deload**: 50% volume, 60% intensity

### 4. Category Mapping — NEW STAGE (`category-mapper.ts`)

Before exercises are selected, the engine assigns **movement pattern categories** to each slot on each day. This creates the "lanes" that exercises fill.

**Category mapping per split day:**

```
Push Day:
  1. horizontal_push  (primary_compound)  → muscles: [chest, triceps]
  2. vertical_push    (primary_compound)  → muscles: [shoulders, triceps]
  3. chest_isolation   (isolation)         → muscles: [chest]
  4. shoulder_isolation (isolation)        → muscles: [shoulders]
  5. tricep            (isolation)         → muscles: [triceps]

Pull Day:
  1. horizontal_pull  (primary_compound)  → muscles: [back, biceps]
  2. vertical_pull    (primary_compound)  → muscles: [back, biceps]
  3. back_isolation    (isolation)         → muscles: [back, rear_delts]
  4. bicep             (isolation)         → muscles: [biceps]
  5. rotator_cuff      (accessory)        → muscles: [rear_delts, shoulders]

Leg Day:
  1. squat            (primary_compound)  → muscles: [quads, glutes]
  2. hip_hinge        (primary_compound)  → muscles: [hamstrings, glutes, back]
  3. lunge            (secondary_compound)→ muscles: [quads, glutes]
  4. hamstring_isolation (isolation)       → muscles: [hamstrings]
  5. calf              (isolation)         → muscles: [calves]
  6. core              (accessory)        → muscles: [core]

Upper Day (Upper/Lower split):
  1. horizontal_push  (primary_compound)  → muscles: [chest, triceps]
  2. horizontal_pull  (primary_compound)  → muscles: [back, biceps]
  3. vertical_push    (secondary_compound)→ muscles: [shoulders, triceps]
  4. vertical_pull    (secondary_compound)→ muscles: [back, biceps]
  5. bicep OR tricep  (isolation)         → muscles: [biceps] or [triceps]
  6. shoulder_isolation (isolation)        → muscles: [shoulders]

Lower Day (Upper/Lower split):
  1. squat            (primary_compound)  → muscles: [quads, glutes]
  2. hip_hinge        (primary_compound)  → muscles: [hamstrings, glutes]
  3. lunge            (secondary_compound)→ muscles: [quads, glutes]
  4. glute_isolation   (isolation)         → muscles: [glutes]
  5. calf              (isolation)         → muscles: [calves]
  6. core              (accessory)        → muscles: [core]

Full Body Day:
  1. squat OR hip_hinge (primary_compound)→ muscles: [quads/hams, glutes]
  2. horizontal_push   (primary_compound) → muscles: [chest, triceps]
  3. horizontal_pull   (secondary_compound)→ muscles: [back, biceps]
  4. vertical_push OR vertical_pull (secondary)→ alternates day-to-day
  5. core              (accessory)        → muscles: [core]
```

**Slot count** is trimmed based on `minutesPerSession` (see Section 6). A 30-minute session only gets slots 1-3; a 90-minute session gets all slots plus extras.

**The engine pre-fills these categories.** The user sees something like:

```
Push Day A:
  [Horizontal Push]  Bench Press - Flat Barbell     4x6-8  RPE 8
    alt: Bench Press - Flat Dumbbell, Chest Press - Machine
  [Vertical Push]    OHP - Standing Barbell          3x8-10 RPE 7
    alt: OHP - Seated Dumbbell, Shoulder Press - Machine
  [Chest Isolation]  Fly - Incline Dumbbell           3x12-15 RPE 7
    alt: Cable Crossover - Low to High, Pec Deck
  ...
```

User can swap primary ↔ alternative, or browse the full category to pick a different exercise entirely.

### 5. Exercise Selection Within Categories (`exercise-selector.ts`)

Once categories are mapped to each day's slots, the selector fills them:

**Selection algorithm (per category slot):**

1. **Filter** exercise library by:
   - `movementPattern` matches the slot's `MovementCategory`
   - `primaryMuscle` or `secondaryMuscles` overlap the slot's `muscleGroups`
   - Equipment is compatible with user's `equipment` setting
   - Not in `excludedExercises`
   - Not targeting injured body parts
2. **Rank** filtered exercises:
   - Equipment preference score (e.g., if `exercisePreference: 'barbell'`, barbell exercises rank higher)
   - Compound preference for primary slots, isolation preference for isolation slots
   - Variety bonus: exercises not already used in other days of the same block
3. **Select primary**: top-ranked exercise
4. **Select alternatives**: next 1-3 ranked exercises that use *different equipment* than primary (so alternatives are meaningful swaps, not just slight variations)
5. **Cross-day deduplication**: in non-full-body splits, the same exercise should not be primary on multiple days. In full body, compounds can repeat with different rep schemes.

**Equipment filtering:**
- `full_gym` → all exercises available
- `barbell_focus` → barbell + dumbbell + bodyweight, limited cable/machine
- `dumbbell_only` → dumbbell + bodyweight only
- `home_minimal` → dumbbell + band + bodyweight
- `bodyweight` → bodyweight only

**Fallback chain** when no exercises match a category:
1. Broaden equipment filter (e.g., allow machines even if `barbell_focus`)
2. Broaden movement category (e.g., `chest_isolation` → any `horizontal_push`)
3. Leave slot as placeholder: `{ exerciseName: "Select exercise", notes: "No matching exercise found" }`

### 5. Rep & Progression Schemes (`progression.ts`)

| Goal | Primary Compound | Secondary Compound | Isolation |
|------|------------------|--------------------|-----------|
| Strength | 3-5 reps, RPE 8-9 | 5-8 reps, RPE 7-8 | 8-12 reps, RPE 7 |
| Hypertrophy | 6-10 reps, RPE 7-8 | 8-12 reps, RPE 7-8 | 12-15 reps, RPE 8 |
| Fat Loss | 8-12 reps, RPE 7 | 10-15 reps, RPE 7 | 12-20 reps, RPE 7 |
| Powerlifting | 1-5 reps, RPE 8-9.5 | 5-8 reps, RPE 7-8 | 8-12 reps, RPE 6-7 |
| General | 6-10 reps, RPE 7 | 8-12 reps, RPE 7 | 10-15 reps, RPE 7 |

**Progression type assignment:**
- Beginner compounds → `linear` (add weight each session)
- Intermediate compounds → `double` (add reps until top of range, then add weight)
- Advanced compounds → `wave` or `percentage_based`
- All isolations → `double` progression
- Deload blocks → `none`

**Progression increments:**
- Upper body barbell: 5 lbs
- Lower body barbell: 10 lbs
- Dumbbell: 5 lbs (per hand)
- Machine/cable: 5-10 lbs
- Bodyweight: add reps

### 6. Session Time Budget

Exercises per session based on `minutesPerSession`:

| Minutes | Compounds | Isolations | Accessories | Total Exercises |
|---------|-----------|------------|-------------|-----------------|
| 30 | 2 | 1 | 0 | 3 |
| 45 | 2 | 2 | 1 | 5 |
| 60 | 2-3 | 2-3 | 1 | 5-7 |
| 75 | 3 | 3 | 2 | 8 |
| 90 | 3 | 3-4 | 2-3 | 8-10 |

### 7. Non-Lifting Modalities

If `modalities` includes stretch/hiit/liss, the engine adds additional BlockDays:

- **stretch** → adds a `mobility` day type with a pre-built stretch routine (links to StretchRoutine)
- **hiit** → adds a `conditioning` day type (2-3x/week max, never on consecutive days or before heavy leg day)
- **liss** → adds `cardio` day type (can be same day as lifting, post-workout, or separate)

Non-lifting days don't count toward the `daysPerWeek` lifting frequency — they're additive or overlap with rest days.

---

## Split Definitions (`rules/splits.ts`)

```typescript
// Each split defines the day templates and their movement category slots.
// 'patterns' are now MovementCategory values that feed into CategoryMapper.

const SPLITS = {
  full_body: {
    daysPerCycle: 1,
    days: [
      {
        name: 'Full Body',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_pull', role: 'secondary_compound' },
          { category: 'vertical_push', role: 'secondary_compound', alternatesWith: 'vertical_pull' },
          { category: 'core', role: 'accessory' },
        ]
      }
    ]
  },
  upper_lower: {
    daysPerCycle: 2,
    days: [
      {
        name: 'Upper',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'vertical_push', role: 'secondary_compound' },
          { category: 'vertical_pull', role: 'secondary_compound' },
          { category: 'bicep', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
        ]
      },
      {
        name: 'Lower',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'calf', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ]
      }
    ]
  },
  push_pull_legs: {
    daysPerCycle: 3,
    days: [
      {
        name: 'Push',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'vertical_push', role: 'primary_compound' },
          { category: 'chest_isolation', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
        ]
      },
      {
        name: 'Pull',
        slots: [
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'vertical_pull', role: 'primary_compound' },
          { category: 'back_isolation', role: 'isolation' },
          { category: 'bicep', role: 'isolation' },
          { category: 'rotator_cuff', role: 'accessory' },
        ]
      },
      {
        name: 'Legs',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'glute_isolation', role: 'isolation' },
          { category: 'calf', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ]
      }
    ]
  },
  push_pull: {
    daysPerCycle: 2,
    days: [
      {
        name: 'Push + Quads',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'squat', role: 'primary_compound' },
          { category: 'vertical_push', role: 'secondary_compound' },
          { category: 'chest_isolation', role: 'isolation' },
          { category: 'quad_isolation', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
        ]
      },
      {
        name: 'Pull + Hams',
        slots: [
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'vertical_pull', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'bicep', role: 'isolation' },
          { category: 'rotator_cuff', role: 'accessory' },
        ]
      }
    ]
  },
  bro_split: {
    daysPerCycle: 5,
    days: [
      {
        name: 'Chest',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_push', role: 'secondary_compound', variant: 'incline' },
          { category: 'chest_isolation', role: 'isolation' },
          { category: 'chest_isolation', role: 'isolation', variant: 'cable' },
        ]
      },
      {
        name: 'Back',
        slots: [
          { category: 'horizontal_pull', role: 'primary_compound' },
          { category: 'vertical_pull', role: 'primary_compound' },
          { category: 'horizontal_pull', role: 'secondary_compound' },
          { category: 'back_isolation', role: 'isolation' },
        ]
      },
      {
        name: 'Shoulders + Arms',
        slots: [
          { category: 'vertical_push', role: 'primary_compound' },
          { category: 'shoulder_isolation', role: 'isolation' },
          { category: 'bicep', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
          { category: 'rotator_cuff', role: 'accessory' },
        ]
      },
      {
        name: 'Legs',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'glute_isolation', role: 'isolation' },
          { category: 'calf', role: 'isolation' },
        ]
      },
      {
        name: 'Arms + Weak Points',
        slots: [
          { category: 'bicep', role: 'isolation' },
          { category: 'tricep', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ]
      }
    ]
  },
  powerlifting: {
    daysPerCycle: 3,
    days: [
      {
        name: 'Squat Day',
        slots: [
          { category: 'squat', role: 'primary_compound' },
          { category: 'squat', role: 'secondary_compound', variant: 'variation' },
          { category: 'lunge', role: 'secondary_compound' },
          { category: 'quad_isolation', role: 'isolation' },
          { category: 'core', role: 'accessory' },
        ]
      },
      {
        name: 'Bench Day',
        slots: [
          { category: 'horizontal_push', role: 'primary_compound' },
          { category: 'horizontal_push', role: 'secondary_compound', variant: 'variation' },
          { category: 'vertical_push', role: 'secondary_compound' },
          { category: 'tricep', role: 'isolation' },
          { category: 'shoulder_isolation', role: 'isolation' },
        ]
      },
      {
        name: 'Deadlift Day',
        slots: [
          { category: 'hip_hinge', role: 'primary_compound' },
          { category: 'hip_hinge', role: 'secondary_compound', variant: 'variation' },
          { category: 'horizontal_pull', role: 'secondary_compound' },
          { category: 'hamstring_isolation', role: 'isolation' },
          { category: 'back_isolation', role: 'isolation' },
        ]
      }
    ]
  }
};
```

---

## Preset Templates (`templates.ts`)

Pre-configured `ProgramConfig` objects the user can pick and modify:

| Template | Goal | Days | Split | Duration | Notes |
|----------|------|------|-------|----------|-------|
| Starting Strength | Strength | 3 | Full Body | 12 wks | Beginner linear progression |
| PPL Hypertrophy | Hypertrophy | 6 | PPL x2 | 12 wks | Classic bodybuilding |
| Upper/Lower Power | Strength | 4 | U/L | 8 wks | Intermediate compound focus |
| 5/3/1 Style | Strength | 4 | Main lift days | 16 wks | Wave loading, 4-week cycles |
| Minimalist | General | 2 | Full Body | 8 wks | Time-crunched, compound-only |
| Cut Program | Fat Loss | 4 | U/L | 8 wks | High frequency, moderate volume |
| Peaking (PL Meet) | Powerlifting | 4 | SBD | 12 wks | Periodized to competition |
| Athletic Circuit | Athletic | 3 | Full Body | 8 wks | Explosive + conditioning |

---

## API Integration

### New Endpoint: `POST /api/programs/generate`

```typescript
// Accepts ProgramConfig, runs the engine, creates all records

export async function POST(req: Request) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  const config: ProgramConfig = await req.json();
  const blueprint: ProgramBlueprint = generate(config);

  // Create Program
  const program = await prisma.program.create({
    data: {
      userId,
      name: blueprint.name,
      description: blueprint.description,
      durationWeeks: blueprint.durationWeeks,
      status: 'active',
    }
  });

  // Create Blocks → BlockDays → BlockDayExercises (from category slots)
  for (const block of blueprint.blocks) {
    const createdBlock = await prisma.block.create({
      data: {
        programId: program.id,
        name: block.name,
        blockNumber: block.blockNumber,
        durationWeeks: block.durationWeeks,
        phase: block.phase,
        status: block.blockNumber === 1 ? 'active' : 'upcoming',
      }
    });

    for (const day of block.days) {
      const createdDay = await prisma.blockDay.create({
        data: {
          blockId: createdBlock.id,
          name: day.name,
          dayNumber: day.dayNumber,
          dayType: day.dayType,
          sortOrder: day.dayNumber,
        }
      });

      // Each CategorySlot becomes a BlockDayExercise
      // Primary exercise is the main entry, first alternative becomes altExerciseId
      for (const slot of day.slots) {
        const primary = slot.primary;
        const firstAlt = slot.alternatives[0];

        await prisma.blockDayExercise.create({
          data: {
            blockDayId: createdDay.id,
            exerciseId: primary.exerciseId,
            altExerciseId: firstAlt?.exerciseId || null,
            sortOrder: slot.sortOrder,
            targetSets: primary.targetSets,
            targetRepRange: primary.targetRepRange,
            targetRpe: primary.targetRpe,
            progressionType: primary.progressionType,
            progressionIncrement: primary.progressionIncrement,
            // Store category metadata in notes for the UI to use
            notes: primary.notes
              ? `[${slot.category}] ${primary.notes}`
              : `[${slot.category}]`,
          }
        });
      }
    }
  }

  // Create metric targets if specified
  if (blueprint.metricTargets) {
    for (const target of blueprint.metricTargets) {
      await prisma.userMetricTarget.upsert({
        where: {
          userId_metricKey_programId: {
            userId, metricKey: target.metricKey, programId: program.id
          }
        },
        create: {
          userId,
          programId: program.id,
          metricKey: target.metricKey,
          targetValue: target.targetValue,
          unit: target.unit,
        },
        update: {
          targetValue: target.targetValue,
        }
      });
    }
  }

  return Response.json({
    programId: program.id,
    warnings: blueprint.warnings || [],  // split suggestions, injury substitutions, etc.
  });
}
```

### Flow

```
1. User fills questionnaire (or picks preset + modifies)
2. Client calls POST /api/programs/generate with ProgramConfig
3. Engine runs, creates all DB records
4. Response: { programId: "..." }
5. Client redirects to /programs/[programId]
6. User sees generated program in existing inline editor
7. User tweaks exercises, sets, reps, etc.
8. Done — program is ready to start
```

---

## Edge Cases & Validation

- **2 days/week + PPL selected**: Don't block — warn the user: "PPL with 2 days means each pattern is hit once every ~10 days. Consider Upper/Lower for more balanced frequency." Let them proceed if they want.
- **Beginner + Bro Split**: Don't block — suggest: "Beginners often progress faster with higher frequency per muscle. Full body or upper/lower are worth considering." User decides.
- **Injuries**: Filter out exercises from categories that primarily target injured body parts. If a primary compound category is excluded (e.g., no `squat` due to knee), substitute with next-best category in same muscle group (e.g., `lunge` or `leg_press`) and add a warning note.
- **No exercises found for a category slot**: Fallback chain: broaden equipment → broaden category → leave placeholder with `notes: "Select exercise"`.
- **Excluded exercises**: Remove from pool before selection. If excluded exercise was going to be primary, promote the top alternative. If all exercises in a category are excluded, use fallback chain.
- **Duplicate exercises across days**: In non-full-body splits, same exercise should not be primary on multiple days. In full body, compounds can repeat across days with different rep schemes (e.g., squat 4x5 Day A, squat 3x10 Day B). Alternatives can overlap across days.
- **Category slot trimming by time**: If `minutesPerSession` is 30, only the first 3 slots are kept. Trimming removes from the bottom (accessories first, then isolations). Compounds are never trimmed.
- **Same category appearing twice on a day** (e.g., bro split chest day has two `horizontal_push` slots): The selector must pick *different* exercises for each — one flat, one incline. The `variant` hint on the slot definition guides this.

---

## Build Order

1. **`types.ts`** — All type definitions (ProgramConfig, Blueprint, CategorySlot, MovementCategory, etc.)
2. **`rules/categories.ts`** — Movement pattern taxonomy, category → muscle group mappings
3. **`rules/splits.ts`** — Split definitions with category slots per day
4. **`rules/volume.ts`** — Volume targets by goal/level/phase
5. **`rules/exercise-pools.ts`** — Exercise library → MovementCategory mapping
6. **`schedule-builder.ts`** — Split suggestion ranking + block structure
7. **`category-mapper.ts`** — Assigns category slots to each day, trims by time budget
8. **`exercise-selector.ts`** — Fills each category slot with primary + alternatives
9. **`progression.ts`** — Rep/RPE/progression assignment per slot role
10. **`templates.ts`** — Preset configs
11. **`index.ts`** — `generate()` function wiring all stages together
12. **`POST /api/programs/generate`** — API endpoint, creates DB records from blueprint
13. **Questionnaire UI** — multi-step form calling the endpoint
