import type { ProgramTemplate } from "./types";

/**
 * Lean Out — 12 weeks, Upper/Lower x4 + cardio, structured deficit.
 *
 * Exercise pool: 2x WEEK / Advanced track (same as Size & Strength) — same lifts
 * because the muscle preservation signal needs to stay heavy. The difference is
 * volume comes down slightly across blocks while cardio steps up.
 *
 * Block 1 — Initiation (weeks 1-4): establish 15% deficit, body adapts
 * Refeed (week 5): maintenance for 7 days
 * Block 2 — Push (weeks 6-9): 18% deficit, +1x cardio, drop 1 accessory set
 * Refeed (week 10): maintenance
 * Block 3 — Final Push (weeks 11-12): 20% deficit, highest cardio, drop 1 accessory exercise
 *
 * Refeeds are NOT deloads — training intensity stays the same, just more food.
 */

export const leanOut: ProgramTemplate = {
  slug: "lean-out",
  name: "Lean Out",
  tagline: "Get visibly leaner. Keep what you built.",
  description:
    "A 12-week cut for someone who already has muscle to preserve. Lifting stays heavy enough to signal 'keep this' while volume drops slightly to match reduced recovery. Cardio is prescribed (not optional). Refeed weeks between blocks restore glycogen, hormones, and motivation. Ends with a final 2-week aggressive push for an event or photoshoot.",

  experienceLevel: "intermediate",
  durationWeeks: 12,
  defaultDaysPerWeek: 4,
  daysPerWeekRange: [3, 4],
  sessionLengthMin: 45,
  sessionLengthMax: 60,
  equipment: "full_gym",
  periodization: "Linear with refeed weeks between blocks",
  goalWeighting: { fat_loss: 60, muscle_preservation: 40 },

  blocks: [
    {
      name: "Initiation",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description:
        "Establish the deficit. Body adapts. Lifting volume at full Block 1 levels — heavy compounds protect muscle.",
      nutritionTarget: {
        calories: "maintenance-15%",
        proteinPerLb: 1.0,
        fatPerLb: 0.4,
        notes:
          "Cut 15% from maintenance TDEE. Protein 1g/lb is non-negotiable — it preserves muscle. Track macros daily. 1 designated 'social meal' per week (still tracked).",
      },
      benchmarks: [
        { label: "Scale loss (7-day avg)", metric: "weight", unit: "lb", targetDescription: "1.0-1.5 lb/week" },
        { label: "Waist", metric: "distance", unit: "in", targetDescription: "-0.5 to -1 inch" },
        { label: "Lifts maintained", metric: "weight", unit: "lb", targetDescription: "No loss in working weights" },
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 16, targetDescription: "16 of 16 (lifts + cardio)" },
      ],
    },
    {
      name: "Push",
      weekStart: 6,
      weekEnd: 9,
      phase: "intensification",
      description:
        "Tighter deficit. Cardio stepped up to 3x/week. Drop 1 accessory set per day to manage recovery.",
      nutritionTarget: {
        calories: "maintenance-18%",
        proteinPerLb: 1.0,
        fatPerLb: 0.35,
        notes:
          "Recalculate maintenance — it's dropped (expected). Cut 18% from new maintenance. Same protein. Optional carb cycling: higher carbs on lifting days, lower on rest.",
      },
      benchmarks: [
        { label: "Total scale loss", metric: "weight", unit: "lb", targetDescription: "5-8 lb total" },
        { label: "Waist", metric: "distance", unit: "in", targetDescription: "-1.5 to -2.5 in total" },
        { label: "Lifts", metric: "weight", unit: "lb", targetDescription: "Maintained or +5 lb on top sets" },
      ],
    },
    {
      name: "Final Push",
      weekStart: 11,
      weekEnd: 12,
      phase: "peaking",
      description:
        "Aggressive 2 weeks. 20% deficit, highest cardio, drop one accessory exercise per day. End with photo + measurement check.",
      nutritionTarget: {
        calories: "maintenance-20%",
        proteinPerLb: 1.0,
        fatPerLb: 0.3,
        notes:
          "20% deficit — briefly aggressive. Higher cardio offsets calorie cut. If hunger 8+ for 5+ days, take an unplanned diet break instead of pushing through.",
      },
      benchmarks: [
        { label: "Total scale loss", metric: "weight", unit: "lb", targetDescription: "8-12 lb total" },
        { label: "Waist", metric: "distance", unit: "in", targetDescription: "-2 to -3 in total" },
        { label: "Lifts retained", metric: "weight", unit: "lb", targetDescription: "Within 5% of starting numbers" },
        { label: "Visible body comp change", metric: "custom", unit: "photo_check", targetDescription: "Side-by-side photos vs week 1" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY A — Upper
    // ===========================================================
    {
      name: "Day A — Upper",
      type: "lifting",
      slots: [
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Bench Press - Flat Barbell",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Chest Press - Plate-Load",
          notes: "Stay heavy. This signals 'keep this muscle.'",
        },
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pull-Ups - Bodyweight",
          alt1: "Pulldowns - Cable",
          alt2: "Pulldown - Plate-Load",
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
          primary: "Row - Single Arm Dumbbell",
          alt1: "Row - Chest Supported Dumbbell",
          alt2: "Row - Single Arm Cable",
          notes: "10/side",
        },
        {
          category: "bicep",
          role: "isolation",
          primary: "Curl - Incline Dumbbell",
          alt1: "Curl - EZ Bar",
          alt2: "Curl - Band",
          notes: "Hammer grip option for elbow-friendly variation.",
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
        // Block 1
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5, notesOverride: "10/side" },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        // Block 2 (drop 1 accessory set)
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5, notesOverride: "10/side" },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        // Block 3 (drop 1 exercise — bicep)
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5, notesOverride: "10/side" },
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "DROPPED in Block 3 to manage recovery" },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
      ],
    },

    // ===========================================================
    // DAY B — Lower
    // ===========================================================
    {
      name: "Day B — Lower",
      type: "lifting",
      slots: [
        {
          category: "squat",
          role: "compound",
          primary: "Squat - High Bar Barbell",
          alt1: "Squat - Goblet Dumbbell",
          alt2: "Squat - Goblet Kettlebell",
          notes: "Stay heavy. Below parallel.",
        },
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Barbell",
          alt1: "Deadlift - Romanian Dumbbell",
          alt2: "Deadlift - Smith Machine Romanian",
        },
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Bulgarian Split Squat Dumbbell",
          alt1: "Lunge - Lateral Bodyweight",
          alt2: "Lunge - Curtsy Dumbbell",
          notes: "10/leg",
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
          primary: "Crunch - Machine",
          alt1: "Pallof Press - Cable",
          alt2: "Russian Twist - Medicine Ball",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 78 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 78 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 78 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "DROPPED in Block 3" },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },

    // ===========================================================
    // DAY C — Upper (Volume Bias)
    // ===========================================================
    {
      name: "Day C — Upper (Volume)",
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
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Bent Over Barbell",
          alt1: "Row - Seated Cable",
          alt2: "Row - Seated Machine",
        },
        {
          category: "horizontal_push",
          role: "accessory",
          primary: "Bench Press - Incline Dumbbell",
          alt1: "Chest Press - Incline Plate-Load",
          alt2: "Bench Press - Incline Barbell",
        },
        {
          category: "vertical_pull",
          role: "accessory",
          primary: "Pulldowns - Wide Grip Cable",
          alt1: "Chin-Ups - Assisted Machine",
          alt2: "Pull-Ups - TRX",
        },
        {
          category: "lateral_delt",
          role: "isolation",
          primary: "Cable Raise - Lateral Cable",
          alt1: "Dumbbell Lateral Raise",
          alt2: "Lateral Raise - Machine",
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
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 4, reps: 6, rir: 1, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "DROPPED in Block 3" },
          { sets: 2, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
      ],
    },

    // ===========================================================
    // DAY D — Lower (Hip-Driven)
    // ===========================================================
    {
      name: "Day D — Lower (Hip)",
      type: "lifting",
      slots: [
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Hex Bar",
          alt1: "Deadlift - Conventional Barbell",
          alt2: "Deadlift - Kettlebell",
          notes: "Heavy hinge. Top set + 2 backoff.",
        },
        {
          category: "quad",
          role: "compound",
          primary: "Leg Press - Machine",
          alt1: "Squat - Front Barbell",
          alt2: "Leg Extension - Machine",
        },
        {
          category: "hip_extension",
          role: "compound",
          primary: "Hip Thrust - Barbell",
          alt1: "Hip Thrust - Dumbbell",
          alt2: "Hip Thrust - Machine",
        },
        {
          category: "quad",
          role: "isolation",
          primary: "Leg Extension - Machine",
          alt1: "Step-Up - Dumbbell",
          alt2: "Squat - Front Barbell",
        },
        {
          category: "hamstring",
          role: "isolation",
          primary: "Leg Curl - Machine",
          alt1: "Glute Bridge - Single Leg Bodyweight",
          alt2: "Leg Curl - Banded",
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
          { sets: 4, reps: 5, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 80 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: 5, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 80 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 2, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: 5, rir: 1, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 80 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 10 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 10 },
          { sets: 2, reps: 15, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "DROPPED in Block 3" },
          { sets: 2, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Cardio is prescribed (not optional) — it accelerates fat loss without eating into recovery. Block 1: 2x/week Z2 walks 30 min. Block 2: 3x/week (2x Z2 + 1x intervals 4x4 min hard / 3 min easy). Block 3: 4x/week (2x Z2 + 1x intervals + 1x steady state 40 min). Walking, incline treadmill, bike, rower, ski erg. Avoid running if untrained — punishes joints in a deficit. Daily steps: 8k baseline, 10k target.",
  conditioningGuidance:
    "Block 1: 1x/week 8-min finisher (KB swings, sled, bike sprint). Block 2-3: 1-2x/week. Burns calories and signals 'don't lose work capacity.'",
  mobilityGuidance:
    "5-min warmup only. No programmed mobility days — recovery is fragile in a deficit.",
  lifestyleGuidance:
    "Sleep 7+ hrs is NON-NEGOTIABLE — sleep deprivation in a deficit = muscle loss. Don't start a cut during a major life stressor. Sunday weekly check-in: 7-day rolling avg weight, photos (front/side/back same lighting), tape measure (waist/chest/arms/thighs), energy 1-10, hunger 1-10. Adjust calories down 100 ONLY if weight hasn't moved in 2 weeks. Diet break rule: if hunger 8+ for 5+ days, take an unplanned 7-day diet break at maintenance. Resume after.",

  customizationInputs: [
    {
      key: "bodyweight_start",
      label: "Current bodyweight (lb)",
      type: "number",
      required: true,
    },
    {
      key: "bodyweight_goal",
      label: "Goal bodyweight (lb)",
      type: "number",
      required: true,
    },
    {
      key: "goal_date",
      label: "Goal date (event/photoshoot/vacation)",
      type: "date",
      required: false,
      helpText: "Drives Block 3 timing. Leave blank if no specific date.",
    },
    {
      key: "bodyfat_estimate",
      label: "Body fat estimate",
      type: "select",
      required: true,
      options: [
        { value: "high", label: "High (visible belly fat, no abs visible)" },
        { value: "medium", label: "Medium (slight belly, abs maybe partly visible)" },
        { value: "low", label: "Low (lean, abs visible — be cautious cutting further)" },
      ],
    },
    {
      key: "days_per_week",
      label: "Days per week (lifting)",
      type: "select",
      required: true,
      options: [
        { value: "3", label: "3 days (full body variant + more cardio)" },
        { value: "4", label: "4 days (Upper/Lower — recommended)" },
      ],
      defaultValue: "4",
    },
    {
      key: "cardio_preference",
      label: "Cardio preference",
      type: "select",
      required: false,
      options: [
        { value: "walking", label: "Walking / incline treadmill" },
        { value: "bike", label: "Bike" },
        { value: "rower", label: "Rower" },
        { value: "mixed", label: "Mixed (variety)" },
      ],
      defaultValue: "mixed",
    },
    {
      key: "recent_cuts",
      label: "How many cuts in the past 12 months?",
      type: "select",
      required: false,
      options: [
        { value: "0", label: "None" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3+", label: "3 or more" },
      ],
      helpText: "Multiple recent cuts → recommend slower pace or reverse diet first.",
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
        { value: "ankle", label: "Ankle" },
      ],
    },
  ],

  engineWarnings: [
    {
      trigger: "Body fat estimate is 'low'",
      message: "You're already lean. Cutting further may compromise hormones and recovery. Consider a slower 0.5 lb/week pace or skip the cut.",
      severity: "warning",
    },
    {
      trigger: "User reports 3+ recent cuts in past 12 months",
      message: "Your metabolism may be downregulated. Consider running a 4-week reverse diet at maintenance first, then start Lean Out.",
      severity: "warning",
    },
    {
      trigger: "User has no muscle baseline",
      message: "Cutting before building muscle gives you a smaller version of yourself. Run Size & Strength first, then Lean Out.",
      severity: "info",
    },
    {
      trigger: "Goal is more than 25 lb in 12 weeks",
      message: "Aggressive timeline — 1.5 lb/week max is sustainable. Either extend the goal date or accept a more aggressive (and harder) cut.",
      severity: "warning",
    },
  ],

  variantNotes:
    "3-day variant: Full body x3 with compound lifts focused, more cardio days. Best for users who'd rather lift less and walk more. Refeed weeks (5 and 10) are inserted as standalone maintenance weeks — same training, more food.",
};
