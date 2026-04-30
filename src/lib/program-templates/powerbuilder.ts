import type { ProgramTemplate } from "./types";

/**
 * Powerbuilder — 16 weeks, 5-day specialty split, block periodization with 1RM test.
 *
 * Exercise pool: 1x WEEK / Advanced track for primary lift days (Squat, Bench,
 * Deadlift, OHP — single specialist day each), and 2x WEEK / Advanced for upper
 * accessory and lower accessory days.
 *
 * Block 1 — Hypertrophy (weeks 1-4): 70-75% 1RM, 8-12 reps, RPE 7-8
 * Block 2 — Strength (weeks 5-10): 80-87% 1RM, 4-6 reps, RPE 8 (6 weeks!)
 * Block 3 — Peak (weeks 11-14): 87-95% 1RM, 1-3 reps, RPE 8-9
 * Block 4 — Deload + Test (weeks 15-16): week 15 deload, week 16 test
 *
 * Heavy on percentages — requires user's current 1RMs at intake.
 */

export const powerbuilder: ProgramTemplate = {
  slug: "powerbuilder",
  name: "Powerbuilder",
  tagline: "Strong on the bar. Built around it.",
  description:
    "A 16-week strength-first program for the lifter who wants meet-ready numbers but isn't competing yet. The big 3 (squat, bench, deadlift) drive the program with real percentages on the bar. Bodybuilding accessories surround them to add muscle that supports the lifts and looks good. Block 1 builds a hypertrophy base, Block 2 builds strength via 80-87% loading, Block 3 sharpens at peak intensity, Block 4 tests new 1RMs.",

  experienceLevel: "advanced",
  durationWeeks: 16,
  defaultDaysPerWeek: 5,
  daysPerWeekRange: [4, 5],
  sessionLengthMin: 75,
  sessionLengthMax: 90,
  equipment: "full_gym",
  periodization: "Block periodization with peak + 1RM test",
  goalWeighting: { strength: 50, muscle: 40, aesthetic: 10 },

  blocks: [
    {
      name: "Hypertrophy",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description:
        "Build a base. 70-75% 1RM on primary lifts at 8-12 reps. Bodybuilding-style accessory volume. RPE 7-8.",
      deloadWeeks: [4],
      nutritionTarget: {
        calories: "maintenance+200",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes:
          "+250 kcal slight surplus. Protein 1g/lb. Carbs prioritized — they fuel volume.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 20, targetDescription: "20 of 20 sessions" },
        { label: "Bench top set", metric: "weight", unit: "lb", targetDescription: "+8 lb from start" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "+15 lb from start" },
        { label: "Deadlift top set", metric: "weight", unit: "lb", targetDescription: "+20 lb from start" },
        { label: "Bodyweight", metric: "weight", unit: "lb", targetDescription: "+2 to +4 lb" },
      ],
    },
    {
      name: "Strength",
      weekStart: 5,
      weekEnd: 10,
      phase: "intensification",
      description:
        "6-week strength block. Primary lifts move from 5x5 @ 80% → 5x3 @ 85% → top single attempts at 90%. RPE 8 throughout.",
      deloadWeeks: [10],
      nutritionTarget: {
        calories: "maintenance+200",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes:
          "+100 kcal. Protein 1g/lb. Performance carbs — eat them around training.",
      },
      benchmarks: [
        { label: "Squat 3RM", metric: "weight", unit: "lb", targetDescription: "New 3RM" },
        { label: "Bench 3RM", metric: "weight", unit: "lb", targetDescription: "New 3RM" },
        { label: "Deadlift 3RM", metric: "weight", unit: "lb", targetDescription: "New 3RM" },
        { label: "Sleep avg", metric: "time", unit: "hr", targetValue: 7, targetDescription: "7+ hr at 5+ nights/week" },
      ],
    },
    {
      name: "Peak",
      weekStart: 11,
      weekEnd: 14,
      phase: "peaking",
      description:
        "87-95% 1RM. Singles, doubles, triples. RPE 8-9. Accessory volume drops 25% to manage fatigue.",
      deloadWeeks: [14],
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes:
          "Maintenance — heavy work doesn't need a surplus. Protein 1g/lb. Carbs for performance.",
      },
      benchmarks: [
        { label: "Heavy single (squat)", metric: "weight", unit: "lb", targetDescription: "~92% 1RM at RPE 9" },
        { label: "Heavy single (bench)", metric: "weight", unit: "lb", targetDescription: "~92% 1RM at RPE 9" },
        { label: "Heavy single (deadlift)", metric: "weight", unit: "lb", targetDescription: "~92% 1RM at RPE 9" },
        { label: "Bar speed on warmup %", metric: "custom", unit: "subjective", targetDescription: "Snappy, not grindy" },
      ],
    },
    {
      name: "Deload + Test",
      weekStart: 15,
      weekEnd: 16,
      phase: "peak_week",
      description:
        "Week 15: deload to 60% volume / 70% intensity. Week 16: 1RM test on Squat (Day 1), Bench (Day 3), Deadlift (Day 5). New PRs.",
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        carbsPerLb: 3.0,
        notes:
          "Maintenance. Carb load 2 days before test day on week 16. Hydrate aggressively (1g/lb sodium target).",
      },
      benchmarks: [
        { label: "Squat 1RM", metric: "weight", unit: "lb", targetDescription: "+5-10% from start" },
        { label: "Bench Press 1RM", metric: "weight", unit: "lb", targetDescription: "+5-8% from start" },
        { label: "Deadlift 1RM", metric: "weight", unit: "lb", targetDescription: "+7-12% from start" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY 1 — Squat
    // ===========================================================
    {
      name: "Day 1 — Squat",
      type: "lifting",
      slots: [
        {
          category: "squat",
          role: "compound",
          primary: "Squat - High Bar Barbell",
          alt1: "Leg Press - Machine",
          alt2: "Squat - Goblet Dumbbell",
          notes: "PRIMARY LIFT. Block 1: 5x5 @ 75%. Block 2: 5x5 → 5x3 @ 85%. Block 3: top single + backoffs. Block 4: TEST.",
        },
        {
          category: "squat",
          role: "accessory",
          primary: "Squat - Pause Front Barbell",
          alt1: "Squat - Front Barbell",
          alt2: "Squat - Box Bodyweight",
          notes: "Pause squat. 3-count pause at the bottom — builds out of the hole.",
        },
        {
          category: "hinge",
          role: "accessory",
          primary: "Deadlift - Romanian Barbell",
          alt1: "Deadlift - Romanian Dumbbell",
          alt2: "Deadlift - Smith Machine Romanian",
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
          role: "isolation",
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
        // Block 1 — Hypertrophy
        [
          { sets: 5, reps: 5, rpe: 7, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 75 },
          { sets: 3, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 2 — Strength (6 weeks)
        [
          { sets: 5, reps: 3, rpe: 8, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 85, notesOverride: "Wave: wk5 5x5@80%, wk6 5x3@85%, wk7 4x3@87%, wk8 3x3@90%, wk9 5x3@85%, wk10 deload" },
          { sets: 3, reps: 5, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 6, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 3 — Peak
        [
          { sets: 1, reps: 1, rpe: 9, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 92, notesOverride: "Heavy single + 2x3 backoff @ -10%" },
          { sets: 3, reps: 3, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 5, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 4 — Deload + Test
        [
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "Wk15 deload: 3x3 @ 70%. Wk16 TEST: work up to 1RM (warmup ladder 60/75/85/92/100%)." },
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "Skip in week 16" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
        ],
      ],
    },

    // ===========================================================
    // DAY 2 — Bench
    // ===========================================================
    {
      name: "Day 2 — Bench",
      type: "lifting",
      slots: [
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Bench Press - Flat Barbell",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Chest Press - Plate-Load",
          notes: "PRIMARY LIFT. Block 1: 5x5 @ 75%. Block 2: 5x5 → 5x3 @ 85%. Block 3: heavy single + backoffs. Block 4: TEST.",
        },
        {
          category: "horizontal_push",
          role: "accessory",
          primary: "Bench Press - Close Grip Barbell",
          alt1: "Bench Press - Incline Dumbbell",
          alt2: "Chest Press - Incline Plate-Load",
          notes: "Close-grip bench. Builds triceps + lockout strength.",
        },
        {
          category: "vertical_push",
          role: "accessory",
          primary: "Overhead Press - Seated Dumbbell",
          alt1: "Shoulder Press - Plate-Load",
          alt2: "Shoulder Press - Smith Machine",
        },
        {
          category: "horizontal_pull",
          role: "accessory",
          primary: "Row - Bent Over Barbell",
          alt1: "Row - Seated Cable",
          alt2: "Row - Seated Machine",
        },
        {
          category: "tricep",
          role: "isolation",
          primary: "Tricep Extension - Skull Crusher Barbell",
          alt1: "Tricep Extension - Overhead Dumbbell",
          alt2: "Tricep Press - TRX",
        },
        {
          category: "lateral_delt",
          role: "isolation",
          primary: "Cable Raise - Lateral Cable",
          alt1: "Dumbbell Lateral Raise",
          alt2: "Lateral Raise - Machine",
        },
      ],
      perBlockParams: [
        [
          { sets: 5, reps: 5, rpe: 7, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 75 },
          { sets: 3, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 4, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 15, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        [
          { sets: 5, reps: 3, rpe: 8, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 85, notesOverride: "Wave: wk5 5x5@80%, wk6 5x3@85%, wk7 4x3@87%, wk8 3x3@90%, wk9 5x3@85%, wk10 deload" },
          { sets: 3, reps: 5, rpe: 8, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 4, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        [
          { sets: 1, reps: 1, rpe: 9, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 92, notesOverride: "Heavy single + 2x3 backoff @ -10%" },
          { sets: 3, reps: 3, rpe: 8, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        [
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "Wk15 deload: 3x3 @ 70%. Wk16 - skip (test on Day 3)" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
        ],
      ],
    },

    // ===========================================================
    // DAY 3 — Deadlift
    // ===========================================================
    {
      name: "Day 3 — Deadlift",
      type: "lifting",
      slots: [
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Conventional Barbell",
          alt1: "Deadlift - Hex Bar",
          alt2: "Deadlift - Romanian Dumbbell",
          notes: "PRIMARY LIFT. Block 1: 4x6 @ 75%. Block 2: 5x3 @ 85%. Block 3: heavy single + 2x3. Block 4: TEST.",
        },
        {
          category: "hinge",
          role: "accessory",
          primary: "Deadlift - Hex Bar",
          alt1: "Deadlift - Romanian Barbell",
          alt2: "Deadlift - Conventional Barbell",
          notes: "Variation lift — builds bottom-end strength.",
        },
        {
          category: "squat",
          role: "accessory",
          primary: "Squat - Front Barbell",
          alt1: "Leg Press - Machine",
          alt2: "Leg Extension - Machine",
        },
        {
          category: "hamstring",
          role: "isolation",
          primary: "Leg Curl - Machine",
          alt1: "Nordic Curl - Assisted Bodyweight",
          alt2: "Leg Curl - Banded",
        },
        {
          category: "horizontal_pull",
          role: "accessory",
          primary: "Row - Chest Supported Dumbbell",
          alt1: "Row - Single Arm Dumbbell",
          alt2: "Row - Single Arm Cable",
          notes: "Upper back work that doesn't fight deadlift recovery.",
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
          { sets: 4, reps: 6, rpe: 7, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 75 },
          { sets: 3, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 12, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 5, reps: 3, rpe: 8, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 85, notesOverride: "Wave: wk5 4x4@80%, wk6 5x3@85%, wk7 4x3@87%, wk8 3x2@90%, wk9 5x3@85%, wk10 deload" },
          { sets: 3, reps: 5, rpe: 8, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 1, reps: 1, rpe: 9, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 92, notesOverride: "Heavy single + 2x3 backoff @ -10%" },
          { sets: 3, reps: 3, rpe: 8, progressionType: "linear", progressionIncrement: 10 },
          { sets: 2, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 2, reps: 10, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 1, reps: 1, rpe: 10, progressionType: "none", loadPercent: 100, notesOverride: "Wk15: 3x3 @ 70% deload. Wk16: BENCH 1RM TEST. Warm-up ladder: 60/75/85/92/100%." },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
        ],
      ],
    },

    // ===========================================================
    // DAY 4 — Upper Accessory
    // ===========================================================
    {
      name: "Day 4 — Upper Accessory",
      type: "lifting",
      slots: [
        {
          category: "vertical_push",
          role: "compound",
          primary: "Overhead Press - Standing Barbell",
          alt1: "Shoulder Press - Machine",
          alt2: "Overhead Press - Standing Dumbbell",
          notes: "Standing OHP — strict, full lockout. Block-style loading like the big 3.",
        },
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pull-Ups - Bodyweight",
          alt1: "Pulldowns - Cable",
          alt2: "Pulldown - Plate-Load",
          notes: "Weighted if able. Otherwise strict bodyweight.",
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
          primary: "Row - Single Arm Dumbbell",
          alt1: "Row - Single Arm Cable",
          alt2: "Row - Chest Supported Dumbbell",
          notes: "10/side",
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
          primary: "Tricep Pressdown - Cable",
          alt1: "Tricep Dip - Machine",
          alt2: "Close Grip Push-Up - Bodyweight",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 6, rpe: 7, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 75 },
          { sets: 4, reps: 6, rpe: 8, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5, notesOverride: "10/side" },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 5, reps: 4, rpe: 8, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 82 },
          { sets: 4, reps: 5, rpe: 8, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5, notesOverride: "10/side" },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 4, reps: 3, rpe: 8, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 88 },
          { sets: 4, reps: 4, rpe: 8, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 8, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5, notesOverride: "10/side" },
          { sets: 2, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 3, reps: 3, rpe: 7, progressionType: "none", loadPercent: 70, notesOverride: "Deload week 15. Wk16: skip Day 4 (rest before deadlift test on Day 5)." },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
        ],
      ],
    },

    // ===========================================================
    // DAY 5 — Lower Accessory (optional, removed for 4-day variant)
    // ===========================================================
    {
      name: "Day 5 — Lower Accessory",
      type: "lifting",
      slots: [
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Bulgarian Split Squat Dumbbell",
          alt1: "Lunge - Lateral Bodyweight",
          alt2: "Lunge - Curtsy Dumbbell",
          notes: "10/leg",
        },
        {
          category: "hinge",
          role: "accessory",
          primary: "Band Good Morning",
          alt1: "Deadlift - Romanian Dumbbell",
          alt2: "Deadlift - Romanian Single Leg Dumbbell",
          notes: "Good morning — posterior chain reinforcement that doesn't fight deadlift recovery.",
        },
        {
          category: "hamstring",
          role: "isolation",
          primary: "Leg Curl - Machine",
          alt1: "Glute Bridge - Single Leg Bodyweight",
          alt2: "Leg Curl - Banded",
        },
        {
          category: "quad",
          role: "isolation",
          primary: "Leg Press - Machine",
          alt1: "Step-Up - Dumbbell",
          alt2: "Squat - Front Barbell",
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
          primary: "Leg Raise - Hanging",
          alt1: "Plank - Side Bodyweight",
          alt2: "Crunch - Machine",
        },
      ],
      perBlockParams: [
        [
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 15, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 10 },
          { sets: 4, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 3, reps: 8, rpe: 8, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg" },
          { sets: 3, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 10 },
          { sets: 4, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 2, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg" },
          { sets: 2, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 1, reps: 1, rpe: 10, progressionType: "none", loadPercent: 100, notesOverride: "Wk15: skip (deload). Wk16: DEADLIFT 1RM TEST. Warm-up ladder: 60/75/85/92/100%." },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Block 1-2: 1x/week walking 20-30 min. Block 3: 0-1x walking on off-days. Block 4: 0x — rest before test. Cardio is for recovery, not fat loss. If you want to lean out, run Lean Out instead.",
  conditioningGuidance: "SKIPPED. Conditioning eats into recovery for heavy work.",
  mobilityGuidance:
    "Programmed pre-session by lift: Pre-squat: goblet hold, 90/90 hip, ankle dorsiflexion, couch stretch. Pre-bench: T-spine rotations, scap pushups, band pull-aparts, lat stretch. Pre-deadlift: hip hinge drill, glute clamshells, cat-cow, hamstring scoops. Optional 10-min daily mobility focused on hip and T-spine.",
  lifestyleGuidance:
    "Sleep 8 hr target — heavy training demands recovery. No max-effort work in high-stress weeks (drop to RPE 7). Track resting HR each morning (5+ bpm above baseline = back off), bar speed on warmup sets (slow = under-recovered), subjective readiness 1-10. Weekly check-in: top sets hit? sleep avg? bar speed snappy or grindy? new joint pain?",

  customizationInputs: [
    {
      key: "days_per_week",
      label: "Days per week",
      type: "select",
      required: true,
      options: [
        { value: "4", label: "4 days (drops Day 5 — Lower Accessory)" },
        { value: "5", label: "5 days (full split — recommended)" },
      ],
      defaultValue: "5",
    },
    {
      key: "current_squat_1rm",
      label: "Current Squat 1RM (lb)",
      type: "number",
      required: true,
      helpText: "Required — drives all percentage prescriptions. Use estimated if unsure (working weight x reps, plug into Epley calculator).",
    },
    {
      key: "current_bench_1rm",
      label: "Current Bench Press 1RM (lb)",
      type: "number",
      required: true,
    },
    {
      key: "current_deadlift_1rm",
      label: "Current Deadlift 1RM (lb)",
      type: "number",
      required: true,
    },
    {
      key: "current_ohp_1rm",
      label: "Current Standing OHP 1RM (lb) — optional",
      type: "number",
      required: false,
      helpText: "If unknown, we'll use 0.65x your bench 1RM as a default.",
    },
    {
      key: "bodyweight",
      label: "Bodyweight (lb)",
      type: "number",
      required: true,
    },
    {
      key: "goal_direction",
      label: "Bodyweight goal direction",
      type: "select",
      required: true,
      options: [
        { value: "gain", label: "Gain (intentional muscle gain)" },
        { value: "maintain", label: "Maintain" },
      ],
      defaultValue: "gain",
    },
    {
      key: "weak_lift",
      label: "Any weak lift to prioritize?",
      type: "select",
      required: false,
      options: [
        { value: "none", label: "None / balanced" },
        { value: "squat", label: "Squat" },
        { value: "bench", label: "Bench" },
        { value: "deadlift", label: "Deadlift" },
      ],
      defaultValue: "none",
      helpText: "Adds 1 accessory exercise on the relevant primary day.",
    },
    {
      key: "sticking_points",
      label: "Sticking points (optional)",
      type: "multi_select",
      required: false,
      options: [
        { value: "bench_lockout", label: "Bench: lockout (top half)" },
        { value: "bench_off_chest", label: "Bench: off the chest" },
        { value: "squat_hole", label: "Squat: out of the hole" },
        { value: "deadlift_off_floor", label: "Deadlift: off the floor" },
        { value: "deadlift_lockout", label: "Deadlift: lockout" },
      ],
      helpText: "Drives variation lift selection (e.g., close-grip bench for lockout, pause squat for hole).",
    },
    {
      key: "competition_target",
      label: "Have a meet date?",
      type: "date",
      required: false,
      helpText: "If you're competing, run Meet Prep instead of Powerbuilder.",
    },
  ],

  engineWarnings: [
    {
      trigger: "User has a meet date in the next 16 weeks",
      message: "If you're competing, run Meet Prep instead — Powerbuilder has bodybuilding accessories that aren't optimal for peak.",
      severity: "warning",
    },
    {
      trigger: "User reports lower back / knee / shoulder injury",
      message: "Powerbuilder runs heavy percentages on the big 3. Run Comeback first if any joint is currently flared up.",
      severity: "warning",
    },
    {
      trigger: "User doesn't know their 1RMs",
      message: "Powerbuilder requires current 1RMs to drive percentage loading. Run 4 weeks of consistent training first to establish them, or use Size & Strength which doesn't need 1RM data.",
      severity: "error",
    },
    {
      trigger: "User reports <2 years consistent training",
      message: "Powerbuilder is intermediate-to-advanced. If you've been lifting <2 years, Size & Strength will deliver more progress because beginner gains aren't done yet.",
      severity: "info",
    },
    {
      trigger: "Goal direction is 'lose'",
      message: "Don't run Powerbuilder in a deficit — strength suffers. Either gain through this program or run Lean Out instead.",
      severity: "warning",
    },
  ],

  variantNotes:
    "4-day variant: drops Day 5 (Lower Accessory). Keeps the big 3 + Upper Accessory. Best for users who can't do 5 days but want serious strength work. Test week 16: 1RM tests on Squat (Day 1), Bench (Day 3), Deadlift (Day 5). 48 hours rest between each.",

  // R13 — spec §7 per-gameplan lifestyle picks. Seeded as 3
  // LifestyleTarget rows server-side after clone.
  defaultLifestylePicks: [
    { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
    { key: "stress", value: 3, unit: "scale", comparator: "lte" },
    { key: "mobility_minutes", value: 10, unit: "min", comparator: "gte" },
  ],

  // R13 — refeed cadence in weeks within each block. Lean Out only;
  // null for everything else.
  defaultRefeedCadence: null,
};
