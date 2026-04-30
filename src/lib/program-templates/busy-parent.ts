import type { ProgramTemplate } from "./types";

/**
 * Busy Parent / Pro — 12 weeks, 2-3 sessions/week, 30-45 min, supersets-driven.
 *
 * Built for someone with limited time: a parent of young kids, a professional
 * with unpredictable schedules, anyone who can't reliably hit 4+ sessions.
 * Every session is full-body. Compounds are paired in supersets to compress
 * the total session length without dropping volume.
 *
 * Exercise pool: 3x WEEK Basic (machine/dumbbell first, time-efficient) plus
 * occasional Advanced compound when ready.
 *
 * Block 1 — Build (weeks 1-4): 3 sessions/week, learn the supersets, build base
 * Block 2 — Run (weeks 5-8): 2-3 sessions/week (whatever the week allows), heavier
 * Block 3 — Lock In (weeks 9-12): consistency-focused, slight intensity bump
 *
 * Mid-block deloads aren't formal — just lower-RPE sessions when life is heavy.
 */

export const busyParent: ProgramTemplate = {
  slug: "busy-parent",
  name: "Busy Parent / Pro",
  tagline: "Real progress on real schedules. 30-45 min, twice or thrice a week.",
  description:
    "A 12-week program for someone with a real life. Every session is full body, paired into supersets so 30-45 minutes is enough. Designed to flex between 2 and 3 sessions per week — life gets in the way, the program adapts. Bodyweight, dumbbell, and machine options keep it portable. The goal isn't peak performance; it's consistency, strength, and looking better in clothes.",

  experienceLevel: "any",
  durationWeeks: 12,
  defaultDaysPerWeek: 3,
  daysPerWeekRange: [2, 3],
  sessionLengthMin: 30,
  sessionLengthMax: 45,
  equipment: "full_gym",
  periodization: "Linear with weekly flexibility (2-3 sessions)",
  goalWeighting: { habit: 40, muscle: 30, strength: 30 },

  blocks: [
    {
      name: "Build",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description:
        "Learn the supersets. Build the routine. Aim for 3 sessions/week — settle for 2 if life happens.",
      nutritionTarget: {
        proteinPerLb: 0.8,
        notes:
          "Protein at every meal (palm-sized portion). Drink water before each meal. Don't track strictly — just hit protein and prep one meal in advance per day.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 9, targetDescription: "9 of 12 sessions (75% adherence)" },
        { label: "Working weights stable", metric: "custom", unit: "subjective", targetDescription: "Same numbers feel easier" },
      ],
    },
    {
      name: "Run",
      weekStart: 5,
      weekEnd: 8,
      phase: "accumulation",
      description:
        "The middle block. You know the program. Adjust intensity to life: 3 sessions when good, 2 sessions when heavy. Same workouts either way.",
      nutritionTarget: {
        proteinPerLb: 0.9,
        notes:
          "Protein still at every meal. Optional 3 days/week macro tracking to learn portions. Limit liquid calories.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 9, targetDescription: "9 of 12 sessions" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "+10-15 lb from start" },
        { label: "Visible muscle change", metric: "custom", unit: "photo_check", targetDescription: "Compare to week 1 photos" },
      ],
    },
    {
      name: "Lock In",
      weekStart: 9,
      weekEnd: 12,
      phase: "intensification",
      description:
        "Final push. Slight intensity bump. The goal isn't a 1RM — it's becoming someone who lifts as part of life.",
      nutritionTarget: {
        proteinPerLb: 1.0,
        calories: "maintenance",
        notes:
          "Protein 1g/lb if you can. If not, don't stress — keep doing what's working.",
      },
      benchmarks: [
        { label: "Total sessions", metric: "custom", unit: "sessions", targetValue: 27, targetDescription: "27+ of 36 (75%)" },
        { label: "Felt-stronger check", metric: "custom", unit: "yes/no", targetDescription: "Yes = lift carries to daily life (lifting kids, groceries, etc.)" },
        { label: "Bodyweight check", metric: "weight", unit: "lb", targetDescription: "Within 3 lb of start (recomp goal)" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY A — Push Focus (Squat + Press supersets)
    // ===========================================================
    {
      name: "Day A — Push Focus",
      type: "lifting",
      slots: [
        // Superset 1: Squat + Push
        {
          category: "squat",
          role: "compound",
          primary: "Squat - Goblet Dumbbell",
          alt1: "Squat - Goblet Kettlebell",
          alt2: "Leg Press - Machine",
          notes: "SUPERSET 1A with Chest Press. Rest 60s after the pair.",
        },
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Chest Press - Machine",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Push-Up - Standard Bodyweight",
          notes: "SUPERSET 1B with Squat. No rest between.",
        },
        // Superset 2: Lunge + Press
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Reverse Bodyweight",
          alt1: "Lunge - Forward Dumbbell",
          alt2: "Step-Up - Bodyweight",
          notes: "SUPERSET 2A with OHP. 10/leg. Rest 45s after the pair.",
        },
        {
          category: "vertical_push",
          role: "accessory",
          primary: "Overhead Press - Seated Dumbbell",
          alt1: "Shoulder Press - Plate-Load",
          alt2: "Shoulder Press - Smith Machine",
          notes: "SUPERSET 2B with Lunge.",
        },
        // Standalone core finisher
        {
          category: "core",
          role: "isolation",
          primary: "Plank - Standard Bodyweight",
          alt1: "Dead Bug - Bodyweight",
          alt2: "Pallof Press - Band",
          notes: "Core finisher. 30-60s hold.",
        },
      ],
      perBlockParams: [
        // Block 1
        [
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/leg" },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 30, progressionType: "linear", progressionIncrement: 0, notesOverride: "30s hold" },
        ],
        // Block 2
        [
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg, add light DBs" },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 45, progressionType: "linear", progressionIncrement: 0, notesOverride: "45s hold" },
        ],
        // Block 3
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Top set heavier — graduate to barbell back squat if confident" },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg, dumbbells" },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 60, progressionType: "linear", progressionIncrement: 0, notesOverride: "60s hold" },
        ],
      ],
    },

    // ===========================================================
    // DAY B — Pull Focus (Hinge + Pull supersets)
    // ===========================================================
    {
      name: "Day B — Pull Focus",
      type: "lifting",
      slots: [
        // Superset 1: Hinge + Vertical Pull
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Dumbbell",
          alt1: "Deadlift - Kettlebell",
          alt2: "Deadlift - Smith Machine Romanian",
          notes: "SUPERSET 1A with Pulldown. Rest 60s after pair.",
        },
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pulldowns - Cable",
          alt1: "Pull-Ups - Assisted Machine",
          alt2: "Pulldown - Plate-Load",
          notes: "SUPERSET 1B with RDL.",
        },
        // Superset 2: Glute + Row
        {
          category: "hip_extension",
          role: "compound",
          primary: "Hip Thrust - Dumbbell",
          alt1: "Glute Bridge - Banded",
          alt2: "Hip Thrust - Banded",
          notes: "SUPERSET 2A with Row.",
        },
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Seated Cable",
          alt1: "Row - Single Arm Dumbbell",
          alt2: "Row - Seated Machine",
          notes: "SUPERSET 2B with Hip Thrust.",
        },
        // Standalone bicep finisher
        {
          category: "bicep",
          role: "isolation",
          primary: "Curl - Dumbbell",
          alt1: "Curl - Cable",
          alt2: "Curl - Hammer Dumbbell",
          notes: "2-3 sets to finish. Pump work.",
        },
      ],
      perBlockParams: [
        [
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Top set heavier — RDL or trap bar if confident" },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Add barbell hip thrust if confident" },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
      ],
    },

    // ===========================================================
    // DAY C — Mixed (full body, lighter — for the 3rd day in good weeks)
    // ===========================================================
    {
      name: "Day C — Mixed (Optional 3rd Day)",
      type: "lifting",
      slots: [
        // Superset 1: Single-leg + Press
        {
          category: "lunge",
          role: "compound",
          primary: "Lunge - Reverse Bodyweight",
          alt1: "Step-Up - Dumbbell",
          alt2: "Lunge - Forward Dumbbell",
          notes: "SUPERSET 1A with Push-Up. 10/leg.",
        },
        {
          category: "horizontal_push",
          role: "accessory",
          primary: "Push-Up - Standard Bodyweight",
          alt1: "Bench Press - Incline Dumbbell",
          alt2: "Chest Press - Incline Plate-Load",
          notes: "SUPERSET 1B with Lunge. AMRAP option.",
        },
        // Superset 2: Lateral hip + Row
        {
          category: "core",
          role: "isolation",
          primary: "Lateral Walk - Band",
          alt1: "Side Lying Leg Raise - Bodyweight",
          alt2: "Clamshell - Band",
          notes: "SUPERSET 2A with Row. 10/side.",
        },
        {
          category: "horizontal_pull",
          role: "accessory",
          primary: "Row - TRX",
          alt1: "Row - Resistance Band",
          alt2: "Row - Single Arm Dumbbell",
          notes: "SUPERSET 2B with Lateral Walk.",
        },
        // Carry finisher
        {
          category: "core",
          role: "compound",
          primary: "Farmer's Walk - Dumbbell",
          alt1: "Farmer's Walk - Kettlebell",
          alt2: "Bear Crawl - Bodyweight",
          notes: "Carry finisher. 30-40s walks. Heavy as you can hold.",
        },
      ],
      perBlockParams: [
        [
          { sets: 2, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/leg" },
          { sets: 2, reps: "AMRAP", rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0, notesOverride: "12/side" },
          { sets: 2, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 30, progressionType: "linear", progressionIncrement: 5, notesOverride: "30s walks" },
        ],
        [
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg, add DBs" },
          { sets: 3, reps: "AMRAP", rir: 0, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5, notesOverride: "40s walks" },
        ],
        [
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg, dumbbells" },
          { sets: 3, reps: "AMRAP", rir: 0, progressionType: "linear", progressionIncrement: 0, notesOverride: "Move to incline DB press" },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5, notesOverride: "40s walks, heavy" },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Walking — that's it. Aim for 6-8k daily steps as a baseline. If you have time for structured cardio, do 1x/week 20-30 min Z2 (walk, bike, easy row). No intervals, no HIIT — recovery is too fragile when sessions are limited.",
  conditioningGuidance:
    "The Day C Farmer's Walk finisher is your conditioning. Skip if your week is brutal.",
  mobilityGuidance:
    "5-min warmup max. Same routine every time so you don't think: cat-cow x5, world's greatest stretch x3/side, hip circles x5, arm circles, 5 bodyweight squats. Optional 5-min evening hip routine before bed.",
  lifestyleGuidance:
    "Schedule sessions like meetings — same days, same times. Tell your partner / colleagues it's locked. The 2-day weeks aren't failures, they're the system working. Track only: did I work out today? (yes/no). Sleep: protect 7+ hr by reverse-engineering bedtime from wake-up time. Don't sacrifice sleep for sessions.",

  customizationInputs: [
    {
      key: "schedule_consistency",
      label: "How consistent is your weekly schedule?",
      type: "select",
      required: true,
      options: [
        { value: "predictable", label: "Predictable — same 3 days work every week" },
        { value: "flexible", label: "Flexible — varies week to week (2-3 days)" },
        { value: "chaotic", label: "Chaotic — can't predict more than 48 hours out" },
      ],
      defaultValue: "flexible",
      helpText: "If 'chaotic', we'll lean toward 2 sessions/week as the baseline.",
    },
    {
      key: "session_length",
      label: "Realistic session length",
      type: "select",
      required: true,
      options: [
        { value: "30", label: "30 minutes (tight)" },
        { value: "45", label: "45 minutes (recommended)" },
        { value: "60", label: "60 minutes (more room for accessories)" },
      ],
      defaultValue: "45",
    },
    {
      key: "training_location",
      label: "Where do you train?",
      type: "select",
      required: true,
      options: [
        { value: "gym", label: "Commercial gym" },
        { value: "home_full", label: "Home gym (rack, bar, plates, DBs)" },
        { value: "home_dumbbells", label: "Home: dumbbells + bench only" },
        { value: "minimal", label: "Minimal: bands + bodyweight only" },
      ],
      defaultValue: "gym",
    },
    {
      key: "experience",
      label: "Lifting experience",
      type: "select",
      required: true,
      options: [
        { value: "new", label: "New to lifting / returning after long break" },
        { value: "casual", label: "Casual / inconsistent" },
        { value: "intermediate", label: "1+ years consistent" },
      ],
      defaultValue: "casual",
    },
    {
      key: "primary_goal",
      label: "Primary goal",
      type: "select",
      required: true,
      options: [
        { value: "muscle", label: "Build muscle" },
        { value: "strength", label: "Get stronger" },
        { value: "general", label: "General fitness / look better in clothes" },
        { value: "fat_loss", label: "Lose fat (note: time-limited cuts are hard)" },
      ],
      defaultValue: "general",
    },
    {
      key: "kid_factor",
      label: "Likely interruptions per session?",
      type: "select",
      required: false,
      options: [
        { value: "none", label: "None — protected time" },
        { value: "occasional", label: "Occasional (1-2 stops)" },
        { value: "frequent", label: "Frequent (kids, calls, both)" },
      ],
      defaultValue: "occasional",
      helpText: "If 'frequent', we'll cut rest periods slightly so the workout still finishes on time.",
    },
    {
      key: "injuries",
      label: "Any current injuries?",
      type: "multi_select",
      required: false,
      options: [
        { value: "knee", label: "Knee" },
        { value: "shoulder", label: "Shoulder" },
        { value: "lower_back", label: "Lower back" },
        { value: "wrist", label: "Wrist" },
      ],
    },
  ],

  engineWarnings: [
    {
      trigger: "Schedule is 'chaotic' AND user wants fat loss",
      message: "Time-limited cuts are tough — recovery and food prep both suffer. Build a base first (recomp), cut later when life settles.",
      severity: "info",
    },
    {
      trigger: "User indicates >4 days/week available",
      message: "Busy Parent is built around 2-3 days. Run Size & Strength or Powerbuilder for a real 4+ day stimulus.",
      severity: "info",
    },
    {
      trigger: "Session length is 30 min only",
      message: "30 min is tight — we'll skip the standalone finisher and run only 2 supersets. Quality > duration.",
      severity: "info",
    },
    {
      trigger: "User reports active lower back injury",
      message: "RDLs and supersets stress the spine. Run Comeback first to rebuild safely.",
      severity: "warning",
    },
  ],

  variantNotes:
    "2-day variant: Run Day A and Day B only, skip Day C. 3rd day is bonus when life cooperates. Home dumbbell variant: machine exercises swap to DB equivalents. Minimal variant: bodyweight + bands only — RDL becomes Banded Good Morning, Pulldown becomes Banded Pulldown.",

  // R13 — spec §7 per-gameplan lifestyle picks. Seeded as 3
  // LifestyleTarget rows server-side after clone.
  defaultLifestylePicks: [
    { key: "steps", value: 6000, unit: "steps", comparator: "gte" },
    { key: "sleep_duration", value: 6.5, unit: "hours", comparator: "gte" },
    { key: "sessions_completed", value: 2, unit: "sessions", comparator: "gte" },
  ],

  // R13 — refeed cadence in weeks within each block. Lean Out only;
  // null for everything else.
  defaultRefeedCadence: null,
};
