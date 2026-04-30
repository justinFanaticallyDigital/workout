import type { ProgramTemplate } from "./types";

/**
 * First 90 Days — 12 weeks, full body x3, linear progression.
 *
 * Exercise pool: 3x WEEK / Basic track (beginner-friendly: machines, dumbbells,
 * bodyweight progressions before barbell movements).
 *
 * Block 1 — Foundation (weeks 1-4): bodyweight + light loads, learn the patterns
 * Block 2 — Build (weeks 5-8): add load, introduce 2nd accessory, push working weights
 * Block 3 — Consolidate (weeks 9-12): heavier compounds, week 12 lighter calibration
 *
 * No formal deloads — beginners recover fast. Last week of each block uses
 * "calibration week" pattern (slightly lower volume, focus on form refinement).
 */

export const first90Days: ProgramTemplate = {
  slug: "first-90-days",
  name: "First 90 Days",
  tagline: "Build the habit. Learn the lifts. Get stronger every week.",
  description:
    "A 12-week beginner program for someone new to lifting or returning after a long break. Full body x3 with the same handful of lifts every week so you can actually see progress. Bodyweight and machines first, then dumbbells, then barbells. Habits matter more than weights for the first 30 days. By week 12 you'll have a base to build on for the rest of your life.",

  experienceLevel: "beginner",
  durationWeeks: 12,
  defaultDaysPerWeek: 3,
  daysPerWeekRange: [3, 4],
  sessionLengthMin: 45,
  sessionLengthMax: 60,
  equipment: "full_gym",
  periodization: "Linear progression with calibration weeks",
  goalWeighting: { strength: 40, muscle: 30, habit: 30 },

  blocks: [
    {
      name: "Foundation",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description:
        "Learn the movements. Bodyweight and light loads. Habit-building is the goal — you won't add much weight here, and that's by design.",
      nutritionTarget: {
        proteinPerLb: 0.7,
        notes:
          "No tracking. Eat protein at every meal (palm-sized portion). Eat a vegetable or fruit at every meal. Drink water before every meal.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 10, targetDescription: "10 of 12 sessions" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "Goblet squat bodyweight x 8" },
        { label: "Daily steps avg", metric: "custom", unit: "steps", targetValue: 7000, targetDescription: "7k+ daily steps" },
      ],
    },
    {
      name: "Build",
      weekStart: 5,
      weekEnd: 8,
      phase: "accumulation",
      description:
        "Add load. Introduce a second accessory per day. Working weights start climbing. You'll feel like a different person by week 8.",
      nutritionTarget: {
        proteinPerLb: 0.8,
        notes:
          "Estimate daily protein. Track for 3 days/week to learn portions. Real breakfast within 90 min of waking. Limit liquid calories (alcohol, sugary drinks).",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 11, targetDescription: "11 of 12" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "1.0-1.25x bodyweight x 8" },
        { label: "Bench top set", metric: "weight", unit: "lb", targetDescription: "0.6-0.75x bodyweight x 8" },
        { label: "Protein hits", metric: "custom", unit: "days_per_week", targetValue: 5, targetDescription: "5+ days/week hitting protein target" },
      ],
    },
    {
      name: "Consolidate",
      weekStart: 9,
      weekEnd: 12,
      phase: "intensification",
      description:
        "Heavier compounds. Test progress. Week 12 is a lighter calibration week — confirm form, lock in numbers, set up for the next program.",
      nutritionTarget: {
        proteinPerLb: 1.0,
        calories: "maintenance",
        notes:
          "Full macros if you want — or just hit protein target daily. Pre/post-workout fueling: carbs + protein within 60 min of training.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 11, targetDescription: "11 of 12" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "1.25-1.5x bodyweight x 8" },
        { label: "Bench top set", metric: "weight", unit: "lb", targetDescription: "0.75-0.9x bodyweight x 8" },
        { label: "Deadlift top set", metric: "weight", unit: "lb", targetDescription: "1.5-1.75x bodyweight x 5" },
        { label: "Sleep avg", metric: "time", unit: "hr", targetValue: 7, targetDescription: "7+ hr at least 5 nights/week" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY A — Squat Focus
    // ===========================================================
    {
      name: "Day A — Squat Focus",
      type: "lifting",
      slots: [
        {
          category: "squat",
          role: "compound",
          primary: "Squat - Goblet Dumbbell",
          alt1: "Squat - Goblet Kettlebell",
          alt2: "Squat - Box Bodyweight",
          notes: "Start with goblet to learn the pattern. Graduate to barbell back squat in Block 2 if form is solid.",
        },
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Chest Press - Machine",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Push-Up - Standard Bodyweight",
          notes: "Machine first. Move to dumbbells when 3x10 feels easy.",
        },
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Seated Cable",
          alt1: "Row - Seated Machine",
          alt2: "Row - TRX",
          notes: "Squeeze shoulder blades. Pause at the chest.",
        },
        {
          category: "hinge",
          role: "accessory",
          primary: "Deadlift - Kettlebell",
          alt1: "Deadlift - Romanian Dumbbell",
          alt2: "Deadlift - Smith Machine Romanian",
          notes: "Light hinge to teach the pattern. Don't max out here.",
        },
        {
          category: "core",
          role: "isolation",
          primary: "Dead Bug - Bodyweight",
          alt1: "Bird Dog - Bodyweight",
          alt2: "Plank - Standard Bodyweight",
          notes: "10/side. Stay slow and controlled.",
        },
      ],
      perBlockParams: [
        // Block 1 — Foundation
        [
          { sets: 3, reps: 8, rir: 3, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: "10-12", rir: 3, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
        // Block 2 — Build (add load, +1 accessory)
        [
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "Move to barbell back squat if form is solid" },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 3 — Consolidate (heavier compounds)
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Top set heavy + 2 backoffs at -10%" },
          { sets: 3, reps: "6-8", rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },

    // ===========================================================
    // DAY B — Hinge Focus
    // ===========================================================
    {
      name: "Day B — Hinge Focus",
      type: "lifting",
      slots: [
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Single Leg Dumbbell",
          alt1: "Deadlift - Romanian Single Leg Kettlebell",
          alt2: "Band Pull-Through",
          notes:
            "Single-leg RDL builds hinge mechanics safely. Move to trap bar / conventional deadlift in Block 2 if pattern is solid.",
        },
        {
          category: "vertical_push",
          role: "compound",
          primary: "Overhead Press - Seated Dumbbell",
          alt1: "Shoulder Press - Plate-Load",
          alt2: "Shoulder Press - Smith Machine",
        },
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pull-Ups - Assisted Machine",
          alt1: "Pulldowns - Wide Grip Cable",
          alt2: "Pulldown - Band",
          notes: "Build to bodyweight pull-up. Assisted machine reduces support each block.",
        },
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Reverse Bodyweight",
          alt1: "Lunge - Forward Dumbbell",
          alt2: "Step-Up - Bodyweight",
          notes: "Reverse lunge is knee-friendly. Add light dumbbells once you can do 10/leg clean.",
        },
        {
          category: "core",
          role: "isolation",
          primary: "Plank - Standard Bodyweight",
          alt1: "Dead Bug - Bodyweight",
          alt2: "Bird Dog - Bodyweight",
        },
      ],
      perBlockParams: [
        [
          { sets: 2, reps: "10-12", rir: 3, progressionType: "linear", progressionIncrement: 5, notesOverride: "10-12/leg" },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 10, rir: 3, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/leg" },
          { sets: 2, reps: 30, progressionType: "linear", progressionIncrement: 0, notesOverride: "30s hold, +5s/week" },
        ],
        [
          { sets: 3, reps: 5, rir: 2, progressionType: "linear", progressionIncrement: 10, notesOverride: "Trap bar deadlift if ready, otherwise continue with single-leg" },
          { sets: 3, reps: "8-10", rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 2, reps: 45, progressionType: "linear", progressionIncrement: 0, notesOverride: "45s hold" },
        ],
        [
          { sets: 3, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 10, notesOverride: "Trap bar or conventional" },
          { sets: 3, reps: "6-8", rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 4, reps: "6-8", rir: 1, progressionType: "linear", progressionIncrement: 0, notesOverride: "Reduce assist or move to bodyweight" },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 3, reps: 60, progressionType: "linear", progressionIncrement: 0, notesOverride: "60s hold" },
        ],
      ],
    },

    // ===========================================================
    // DAY C — Push Focus
    // ===========================================================
    {
      name: "Day C — Push Focus",
      type: "lifting",
      slots: [
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Chest Fly - Machine",
          alt1: "Chest Fly - Dumbbell",
          alt2: "Cable Fly - Chest Cable",
          notes: "Block 1: machine fly to learn chest engagement. Block 2+: shifts to incline DB press for compound work.",
        },
        {
          category: "squat",
          role: "compound",
          primary: "Squat - Sumo Dumbbell",
          alt1: "Squat - TRX Bodyweight",
          alt2: "Squat - Wall Sit Bodyweight",
          notes: "Variation from Day A — wider stance teaches different motor pattern.",
        },
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Wide Grip Cable",
          alt1: "Row - Chest Supported Dumbbell",
          alt2: "Row - TRX",
        },
        {
          category: "lateral_delt",
          role: "isolation",
          primary: "Dumbbell Lateral Raise",
          alt1: "Cable Raise - Lateral Cable",
          alt2: "Lateral Raise - Band",
          notes: "Light. Strict form. No swinging.",
        },
        {
          category: "core",
          role: "isolation",
          primary: "Pallof Press - Band",
          alt1: "Russian Twist - Bodyweight",
          alt2: "Crunch - Machine",
          notes: "10/side anti-rotation.",
        },
      ],
      perBlockParams: [
        [
          { sets: 3, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: "12-15", rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 10, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
        [
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "Move to incline DB press" },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "Add light dumbbells" },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "12-15", rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: "6-8", rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Incline DB press, top set heavy" },
          { sets: 3, reps: "8-10", rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: "8-10", rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Block 1: 1-2x/week walking 20-30 min. Block 2: 2x/week walking or easy bike 25-35 min. Block 3: 2-3x/week walking + 1 optional intervals (4 min hard / 3 min easy x 4). Daily steps: 7k → 8k → 9-10k.",
  conditioningGuidance:
    "Skipped entirely in Block 1. Block 2+: optional 5-min finisher 1x/week (KB swings, sled push, bike sprint). Always optional.",
  mobilityGuidance:
    "5-10 min pre-session, same routine every time: cat-cow x5, world's greatest stretch x3/side, hip circles x5/dir, arm circles x10 each way, bodyweight squat x10, glute bridge x10. Optional 10-min evening routine 3x/week.",
  lifestyleGuidance:
    "Sleep 7-9 hr with consistent bedtime. Workouts on the calendar at the same time each week — treat them like meetings. Sunday weekly check-in: did I hit my workouts? did I sleep enough? did I hit protein most days?",

  customizationInputs: [
    {
      key: "days_per_week",
      label: "How many days per week can you train?",
      type: "select",
      required: true,
      options: [
        { value: "3", label: "3 days (full body — recommended)" },
        { value: "4", label: "4 days (Upper/Lower variant)" },
      ],
      defaultValue: "3",
    },
    {
      key: "experience",
      label: "Have you ever lifted before?",
      type: "select",
      required: true,
      options: [
        { value: "never", label: "Never — total beginner" },
        { value: "long_break", label: "Long break (1+ year off)" },
        { value: "casual", label: "Casual / inconsistent" },
      ],
      defaultValue: "never",
    },
    {
      key: "bodyweight",
      label: "Bodyweight (lb)",
      type: "number",
      required: true,
      helpText: "We use this to scale benchmarks (e.g. 'squat bodyweight x 8').",
    },
    {
      key: "session_length",
      label: "How much time per session?",
      type: "select",
      required: true,
      options: [
        { value: "45", label: "45 minutes" },
        { value: "60", label: "60 minutes" },
      ],
      defaultValue: "60",
    },
    {
      key: "equipment",
      label: "Equipment available",
      type: "select",
      required: true,
      options: [
        { value: "full_gym", label: "Full gym (machines, dumbbells, barbell)" },
        { value: "home_dumbbells", label: "Home dumbbells + bench" },
      ],
      defaultValue: "full_gym",
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
      ],
    },
    {
      key: "weekly_schedule",
      label: "Which days of the week work?",
      type: "multi_select",
      required: false,
      options: [
        { value: "mon", label: "Monday" },
        { value: "tue", label: "Tuesday" },
        { value: "wed", label: "Wednesday" },
        { value: "thu", label: "Thursday" },
        { value: "fri", label: "Friday" },
        { value: "sat", label: "Saturday" },
        { value: "sun", label: "Sunday" },
      ],
      helpText: "Pick 3-4 days that have at least 1 rest day between sessions ideally.",
    },
  ],

  engineWarnings: [
    {
      trigger: "User reports 1+ year of consistent training",
      message: "First 90 Days might be too easy. Consider Size & Strength for a real intermediate progression.",
      severity: "info",
    },
    {
      trigger: "User has no time for 3 sessions/week",
      message: "If 30-45 min is your max, run Busy Parent / Pro instead — it's built around shorter sessions.",
      severity: "info",
    },
    {
      trigger: "User reports active injury (any)",
      message: "If pain is currently >3/10, consider Comeback first to rebuild safely.",
      severity: "warning",
    },
  ],

  variantNotes:
    "4-day variant: same exercises, split as Upper/Lower x4. Recommended only after week 4 if recovered and motivated. Home dumbbell variant: machine exercises swap to DB equivalents (Chest Press → DB Bench, Lat Pulldown → DB pullover + bent-over row, Leg Press → DB goblet squat).",
};
