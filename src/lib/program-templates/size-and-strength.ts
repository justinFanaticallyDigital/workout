import type { ProgramTemplate } from "./types";

/**
 * Size & Strength — 16 weeks, Upper/Lower x4, block periodization.
 *
 * Exercise pool: 2x WEEK / Advanced track from the seeded library.
 * Day A axis = strength bias (flat plane / standard grip).
 * Day B axis = volume bias (incline / wide grip).
 *
 * Block 1 — Accumulation 1 (weeks 1-4): high volume, RIR 2, 4x8 compounds
 * Block 2 — Intensification (weeks 5-8): heavier, RIR 1, 5x4 + 2x8 backoffs at -15%
 * Block 3 — Accumulation 2 (weeks 9-12): highest volume, +1 accessory set, RIR 1
 * Block 4 — Peaking + Test (weeks 13-16): heavy single + backoffs, week 16 = 1RM test
 *
 * Week 4 of every block is a deload (50% volume, 70% intensity).
 */

export const sizeAndStrength: ProgramTemplate = {
  slug: "size-and-strength",
  name: "Size & Strength",
  tagline: "Build the physique. Chase the numbers. Both, not either.",
  description:
    "A 16-week recomp program for intermediates. Block periodization (hypertrophy → strength → hypertrophy → peak/test) on an Upper/Lower x4 split. Top sets and backoffs on every primary lift mean every session has both a strength and volume stimulus. Ends with a 1RM test week.",

  experienceLevel: "intermediate",
  durationWeeks: 16,
  defaultDaysPerWeek: 4,
  daysPerWeekRange: [3, 6],
  sessionLengthMin: 60,
  sessionLengthMax: 75,
  equipment: "full_gym",
  periodization: "Block periodization (4 blocks of 4 weeks)",
  goalWeighting: { muscle: 40, strength: 40, aesthetic: 20 },

  // ----- Blocks -----
  blocks: [
    {
      name: "Accumulation 1",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description: "Hypertrophy base. High volume, RIR 2. Build the foundation.",
      deloadWeeks: [4],
      nutritionTarget: {
        calories: "maintenance+200",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes: "Slight surplus, prioritize carbs around training.",
      },
      benchmarks: [
        { label: "Bench Press top set", metric: "weight", unit: "lb", targetDescription: "+5 lb from start" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "+10 lb from start" },
        { label: "Hex Bar Deadlift top set", metric: "weight", unit: "lb", targetDescription: "+10 lb from start" },
        { label: "Bodyweight", metric: "weight", unit: "lb", targetDescription: "Stable to +1 lb" },
      ],
    },
    {
      name: "Intensification",
      weekStart: 5,
      weekEnd: 8,
      phase: "intensification",
      description: "Strength block. Lower reps, higher load, top sets at RIR 1.",
      deloadWeeks: [8],
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes: "Maintenance — performance fueling, carbs around training.",
      },
      benchmarks: [
        { label: "Bench Press 4RM", metric: "weight", unit: "lb", targetDescription: "New 4RM" },
        { label: "Squat 4RM", metric: "weight", unit: "lb", targetDescription: "New 4RM" },
        { label: "Estimated 1RM", metric: "weight", unit: "lb", targetDescription: "+5-7% from start" },
      ],
    },
    {
      name: "Accumulation 2",
      weekStart: 9,
      weekEnd: 12,
      phase: "accumulation",
      description: "Hypertrophy round 2. Highest volume of the program. +1 accessory set.",
      deloadWeeks: [12],
      nutritionTarget: {
        calories: "maintenance+200",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes: "Slight surplus. This is the biggest growth window.",
      },
      benchmarks: [
        { label: "Volume PR (compounds)", metric: "weight", unit: "lb", targetDescription: "All primaries hit higher reps than B1" },
        { label: "Bodyweight", metric: "weight", unit: "lb", targetDescription: "+2 to +4 lb total from program start" },
        { label: "Visible muscle change", metric: "custom", unit: "photo_check", targetDescription: "Compare to week 1 photos" },
      ],
    },
    {
      name: "Peaking + Test",
      weekStart: 13,
      weekEnd: 16,
      phase: "peaking",
      description: "Two heavy weeks, week 15 deload, week 16 = 1RM test on Squat / Bench / Deadlift.",
      deloadWeeks: [15],
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes: "Maintenance. Carb load 2 days before test day on week 16. Hydrate aggressively.",
      },
      benchmarks: [
        { label: "Squat 1RM", metric: "weight", unit: "lb", targetDescription: "+5-10% from start" },
        { label: "Bench Press 1RM", metric: "weight", unit: "lb", targetDescription: "+5-8% from start" },
        { label: "Deadlift 1RM", metric: "weight", unit: "lb", targetDescription: "+7-12% from start" },
        { label: "Body comp check", metric: "custom", unit: "waist_in", targetDescription: "Waist same or smaller despite gain" },
      ],
    },
  ],

  // ----- Days -----
  // Each day's perBlockParams has 4 entries (one per block).
  // Compounds use percentage_based with progressionIncrement = % step per week.
  // Secondary compounds use linear (5lb upper, 10lb lower).
  // Accessories use double progression.

  days: [
    // ===========================================================
    // DAY A — Upper (Strength Bias)
    // ===========================================================
    {
      name: "Day A — Upper (Strength Bias)",
      type: "lifting",
      slots: [
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Bench Press - Flat Barbell",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Chest Press - Plate-Load",
          notes: "Top set heavy, then backoffs. Touch chest, full lockout.",
        },
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Bent Over Barbell",
          alt1: "Row - Seated Cable",
          alt2: "Row - Seated Machine",
          notes: "Strict, controlled. Pause at chest.",
        },
        {
          category: "vertical_push",
          role: "accessory",
          primary: "Overhead Press - Seated Dumbbell",
          alt1: "Shoulder Press - Plate-Load",
          alt2: "Shoulder Press - Smith Machine",
        },
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pull-Ups - Bodyweight",
          alt1: "Pulldowns - Cable",
          alt2: "Pulldown - Plate-Load",
          notes: "AMRAP first 2 blocks; switch to weighted in B3-B4 if hitting 8+ reps.",
        },
        {
          category: "bicep",
          role: "isolation",
          primary: "Curl - Barbell",
          alt1: "Curl - Cable",
          alt2: "Preacher Curl - Machine",
        },
        {
          category: "tricep",
          role: "isolation",
          primary: "Tricep Extension - Skull Crusher Barbell",
          alt1: "Tricep Extension - Overhead Dumbbell",
          alt2: "Tricep Press - TRX",
        },
      ],
      perBlockParams: [
        // Block 1 — Accumulation
        [
          { sets: 4, reps: 8, rir: 2, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 70 },
          { sets: 4, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: "AMRAP", rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        // Block 2 — Intensification
        [
          { sets: 5, reps: 4, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 85, notesOverride: "Top sets 5x4 @ ~85%, then 2x8 backoff at -15%" },
          { sets: 5, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Weighted pull-up if able" },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        // Block 3 — Accumulation 2 (+1 accessory set)
        [
          { sets: 4, reps: 8, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 75 },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 4, reps: 10, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: "AMRAP", rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 4, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        // Block 4 — Peaking
        [
          { sets: 3, reps: 1, rir: 0, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 92, notesOverride: "Heavy single + 2x5 backoff @ -15%" },
          { sets: 4, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 0, notesOverride: "Weighted" },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
      ],
    },

    // ===========================================================
    // DAY B — Lower (Strength Bias)
    // ===========================================================
    {
      name: "Day B — Lower (Strength Bias)",
      type: "lifting",
      slots: [
        {
          category: "squat",
          role: "compound",
          primary: "Squat - High Bar Barbell",
          alt1: "Squat - Goblet Dumbbell",
          alt2: "Squat - Goblet Kettlebell",
          notes: "Top set heavy, then backoffs. Below parallel.",
        },
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Barbell",
          alt1: "Deadlift - Romanian Dumbbell",
          alt2: "Deadlift - Smith Machine Romanian",
          notes: "Hinge dominant. Bar tracks close to legs.",
        },
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Bulgarian Split Squat Dumbbell",
          alt1: "Lunge - Lateral Bodyweight",
          alt2: "Lunge - Curtsy Dumbbell",
        },
        {
          category: "hamstring",
          role: "isolation",
          primary: "Leg Curl - Machine",
          alt1: "Nordic Curl - Assisted Bodyweight",
          alt2: "Leg Curl - Banded",
        },
        {
          category: "calf",
          role: "isolation",
          primary: "Calf Raise - Standing Machine",
          alt1: "Calf Raise - Standing Dumbbell",
          alt2: "Calf Raise - Standing Bodyweight",
        },
        {
          category: "core",
          role: "isolation",
          primary: "Pallof Press - Cable",
          alt1: "Russian Twist - Medicine Ball",
          alt2: "Wood Chop - Cable",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 8, rir: 2, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 70 },
          { sets: 4, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
        [
          { sets: 5, reps: 4, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 85, notesOverride: "5x4 + 2x8 backoff @ -15%" },
          { sets: 4, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg" },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
        [
          { sets: 4, reps: 8, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 75 },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 4, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 0, notesOverride: "12/side" },
        ],
        [
          { sets: 3, reps: 1, rir: 0, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 92, notesOverride: "Heavy single + 2x5 backoff @ -15%" },
          { sets: 3, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "8/leg" },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
      ],
    },

    // ===========================================================
    // DAY C — Upper (Volume Bias) — Incline / Vertical / Wide
    // ===========================================================
    {
      name: "Day C — Upper (Volume Bias)",
      type: "lifting",
      slots: [
        {
          category: "vertical_push",
          role: "compound",
          primary: "Overhead Press - Standing Barbell",
          alt1: "Shoulder Press - Machine",
          alt2: "Overhead Press - Standing Dumbbell",
        },
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pulldowns - Wide Grip Cable",
          alt1: "Chin-Ups - Assisted Machine",
          alt2: "Pull-Ups - TRX",
        },
        {
          category: "horizontal_push",
          role: "accessory",
          primary: "Bench Press - Incline Dumbbell",
          alt1: "Chest Press - Incline Plate-Load",
          alt2: "Bench Press - Incline Barbell",
        },
        {
          category: "horizontal_pull",
          role: "accessory",
          primary: "Row - Chest Supported Dumbbell",
          alt1: "Row - Single Arm Dumbbell",
          alt2: "Row - Single Arm Cable",
        },
        {
          category: "lateral_delt",
          role: "isolation",
          primary: "Cable Raise - Lateral Cable",
          alt1: "Dumbbell Lateral Raise",
          alt2: "Lateral Raise - Machine",
        },
        {
          category: "rear_delt",
          role: "isolation",
          primary: "Cable Raise - Rear Delt Cable",
          alt1: "Dumbbell Rear Delt Fly",
          alt2: "Face Pull - Band",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 6, rir: 2, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 75 },
          { sets: 4, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        [
          { sets: 4, reps: 4, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 85, notesOverride: "4x4 + 2x8 backoff @ -15%" },
          { sets: 4, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        [
          { sets: 3, reps: 1, rir: 0, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 92, notesOverride: "Heavy single + 2x5 backoff @ -15%" },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
        ],
      ],
    },

    // ===========================================================
    // DAY D — Lower (Volume Bias) — Hex Bar / Front / Hip-Driven
    // ===========================================================
    {
      name: "Day D — Lower (Volume Bias)",
      type: "lifting",
      slots: [
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Hex Bar",
          alt1: "Deadlift - Conventional Barbell",
          alt2: "Deadlift - Kettlebell",
          notes: "Hip hinge with neutral spine. Top set heavy, then backoffs.",
        },
        {
          category: "quad",
          role: "compound",
          primary: "Leg Press - Machine",
          alt1: "Squat - Front Barbell",
          alt2: "Leg Extension - Machine",
        },
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Walking Dumbbell",
          alt1: "Lunge - Reverse Bodyweight",
          alt2: "Lunge - Forward Dumbbell",
        },
        {
          category: "quad",
          role: "isolation",
          primary: "Leg Extension - Machine",
          alt1: "Step-Up - Dumbbell",
          alt2: "Squat - Front Barbell",
        },
        {
          category: "hip_extension",
          role: "compound",
          primary: "Hip Thrust - Barbell",
          alt1: "Hip Thrust - Dumbbell",
          alt2: "Hip Thrust - Machine",
        },
        {
          category: "core",
          role: "isolation",
          primary: "Leg Raise - Hanging",
          alt1: "Plank - Side Bodyweight",
          alt2: "Crunch - Machine",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 78 },
          { sets: 3, reps: 10, rir: 2, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 3, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 5, reps: 3, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 87, notesOverride: "5x3 + 2x6 backoff @ -15%" },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg" },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 80 },
          { sets: 4, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 4, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 3, reps: 1, rir: 0, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 93, notesOverride: "Heavy single + 2x3 backoff @ -10%" },
          { sets: 3, reps: 8, rir: 2, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "8/leg" },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Block 1-2: 0-2x/week Z2 (walk/bike, 20-30 min). Block 3: 1-2x/week Z2 (25-35 min). Block 4: 0-1x walking only (recovery before test).",
  conditioningGuidance: "Optional 5-8 min finisher 0-1x/week. Skipped in Block 4.",
  mobilityGuidance:
    "8-min pre-session warmup: Z1 bike/row 3 min, World's Greatest Stretch 3/side, hip CARs 5/side, T-spine rotation 8/side, movement-specific prep. One mobility-focused day during each deload week.",
  lifestyleGuidance:
    "7-9 hr sleep, 8-10k daily steps. Track morning bodyweight, sleep hours, soreness. Heavy training during high-stress weeks needs intensity reduction.",

  customizationInputs: [
    {
      key: "days_per_week",
      label: "How many days per week can you train?",
      type: "select",
      required: true,
      options: [
        { value: "3", label: "3 days (full body variant)" },
        { value: "4", label: "4 days (Upper/Lower — recommended)" },
        { value: "5", label: "5 days (PPL + Upper/Lower)" },
        { value: "6", label: "6 days (PPL x2)" },
      ],
      defaultValue: "4",
    },
    {
      key: "bodyweight",
      label: "Bodyweight (lb)",
      type: "number",
      required: true,
    },
    {
      key: "goal_direction",
      label: "Goal direction",
      type: "select",
      required: true,
      options: [
        { value: "recomp", label: "Recomp (build muscle, stay lean)" },
        { value: "lean_gain", label: "Lean gain (slight surplus)" },
        { value: "clean_bulk", label: "Clean bulk (intentional muscle gain)" },
      ],
      defaultValue: "recomp",
    },
    {
      key: "estimated_squat_1rm",
      label: "Estimated Squat 1RM (lb) — leave blank if unknown",
      type: "number",
      required: false,
      helpText: "We'll use ~1.0x bodyweight as a conservative starting point if unknown.",
    },
    {
      key: "estimated_bench_1rm",
      label: "Estimated Bench Press 1RM (lb) — leave blank if unknown",
      type: "number",
      required: false,
      helpText: "We'll use ~0.75x bodyweight as a conservative default.",
    },
    {
      key: "estimated_deadlift_1rm",
      label: "Estimated Deadlift 1RM (lb) — leave blank if unknown",
      type: "number",
      required: false,
      helpText: "We'll use ~1.25x bodyweight as a conservative default.",
    },
    {
      key: "weak_point",
      label: "Any weak point to prioritize? (optional)",
      type: "select",
      required: false,
      options: [
        { value: "none", label: "None / balanced" },
        { value: "chest", label: "Chest" },
        { value: "back", label: "Back" },
        { value: "arms", label: "Arms" },
        { value: "legs", label: "Legs" },
        { value: "shoulders", label: "Shoulders" },
      ],
      defaultValue: "none",
      helpText: "Adds 1 accessory set on the relevant day.",
    },
    {
      key: "injuries",
      label: "Any current injuries? (optional)",
      type: "multi_select",
      required: false,
      options: [
        { value: "knee", label: "Knee" },
        { value: "shoulder", label: "Shoulder" },
        { value: "lower_back", label: "Lower back" },
        { value: "wrist", label: "Wrist" },
        { value: "elbow", label: "Elbow" },
      ],
      helpText: "We'll auto-swap exercises that aggravate flagged areas.",
    },
  ],

  engineWarnings: [
    {
      trigger: "User reports <1 year consistent training",
      message: "This program assumes you know the lifts. Try First 90 Days first to build the foundation.",
      severity: "warning",
    },
    {
      trigger: "User wants to lose >5 lb",
      message: "You're better off running Lean Out — Size & Strength is built for recomp/gain.",
      severity: "info",
    },
    {
      trigger: "User reports active shoulder injury",
      message: "Day A bench will swap to Bench Press - Flat Dumbbell; Day C OHP will swap to Shoulder Press - Machine.",
      severity: "info",
    },
    {
      trigger: "User reports active lower back injury",
      message: "Day D Hex Bar Deadlift will swap to Deadlift - Romanian Dumbbell at lower load.",
      severity: "info",
    },
    {
      trigger: "User reports active knee injury",
      message: "Day B Squat will swap to Squat - Goblet Dumbbell; Day D lunges will swap to Step-Up - Dumbbell.",
      severity: "info",
    },
  ],

  variantNotes:
    "3-day variant: Full body x3 with same exercise pool, primary compound rotated, ~25% lower volume. 5-day: PPL Mon-Wed + Upper/Lower Fri-Sat. 6-day: PPL x2.",

  // R13 — spec §7 per-gameplan lifestyle picks. Seeded as 3
  // LifestyleTarget rows server-side after clone.
  defaultLifestylePicks: [
    { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
    { key: "stress", value: 3, unit: "scale", comparator: "lte" },
    { key: "protein_hits", value: 4, unit: "meals", comparator: "gte" },
  ],

  // R13 — refeed cadence in weeks within each block. Lean Out only;
  // null for everything else.
  defaultRefeedCadence: null,
};
