import type { ProgramTemplate } from "./types";

/**
 * Athletic Foundations — 12 weeks, 4-day conjugate-style, plyos + sprints + lifts.
 *
 * For someone training for sport (recreational or otherwise) who wants the
 * full athletic toolkit: explosive power, strength, conditioning, mobility.
 * Days alternate Max Effort and Dynamic Effort sessions in a conjugate pattern,
 * each starting with a power movement (jumps/throws) before the heavy work.
 *
 * Block 1 — General Prep (weeks 1-4): build base, learn power movements
 * Block 2 — Specific Prep (weeks 5-8): heavier ME work, faster DE work, sprint progression
 * Block 3 — Realization (weeks 9-12): peak power output, taper conditioning, jump test week 12
 *
 * Includes prescribed conditioning (alactic/aerobic mix) and dedicated mobility.
 */

export const athleticFoundations: ProgramTemplate = {
  slug: "athletic-foundations",
  name: "Athletic Foundations",
  tagline: "Strong. Fast. Powerful. Explosive when it counts.",
  description:
    "A 12-week program for athletes who need the full toolkit: jumps, sprints, heavy lifts, and the conditioning to use them all. Conjugate-style with Max Effort (heavy) and Dynamic Effort (fast) days alternating across the week. Power work comes before lifts in every session — train explosive when fresh. Conditioning is prescribed (alactic + aerobic), not optional. Ends with a jump test to measure power gains.",

  experienceLevel: "intermediate",
  durationWeeks: 12,
  defaultDaysPerWeek: 4,
  daysPerWeekRange: [4, 5],
  sessionLengthMin: 60,
  sessionLengthMax: 80,
  equipment: "full_gym",
  periodization: "Conjugate (ME / DE alternation) + concurrent power",
  goalWeighting: { power: 35, strength: 30, conditioning: 20, muscle: 15 },

  blocks: [
    {
      name: "General Prep",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description:
        "Base building. Learn the power movements (box jumps, slams, swings). Strength volume at moderate RPE. Conditioning starts easy.",
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        carbsPerLb: 2.0,
        notes:
          "Maintenance for performance. Carbs around training (especially conditioning days). Protein 1g/lb.",
      },
      benchmarks: [
        { label: "Box Jump", metric: "distance", unit: "in", targetDescription: "Establish baseline height" },
        { label: "Broad Jump", metric: "distance", unit: "in", targetDescription: "Establish baseline distance" },
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "+5-10 lb from start" },
        { label: "Conditioning sessions", metric: "custom", unit: "sessions", targetValue: 8, targetDescription: "8 of 8 conditioning sessions" },
      ],
    },
    {
      name: "Specific Prep",
      weekStart: 5,
      weekEnd: 8,
      phase: "intensification",
      description:
        "Heavier ME work, faster DE work. Sprint progression added (technique → tempo → faster). Conditioning intensity climbs.",
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        carbsPerLb: 2.5,
        notes:
          "Slight carb bump for sprint days. Performance fueling pre/post training.",
      },
      benchmarks: [
        { label: "Squat 3RM", metric: "weight", unit: "lb", targetDescription: "+5-8% from week 4 baseline" },
        { label: "Bench 3RM", metric: "weight", unit: "lb", targetDescription: "+5-8%" },
        { label: "20-yard sprint", metric: "time", unit: "seconds", targetDescription: "Establish baseline" },
        { label: "Repeat sprints", metric: "custom", unit: "subjective", targetDescription: "8x40-yard with 90s rest, all under +10% of baseline" },
      ],
    },
    {
      name: "Realization",
      weekStart: 9,
      weekEnd: 12,
      phase: "peaking",
      description:
        "Peak power output. Lower volume, higher intensity. Conditioning tapers — full recovery for jump test in week 12.",
      deloadWeeks: [11],
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        carbsPerLb: 2.5,
        notes:
          "Maintenance. Sleep 8 hr nightly. Pre-test (week 12): carb load 24 hr before.",
      },
      benchmarks: [
        { label: "Box Jump (test)", metric: "distance", unit: "in", targetDescription: "+3-6 inches from week 1" },
        { label: "Broad Jump (test)", metric: "distance", unit: "in", targetDescription: "+4-8 inches from week 1" },
        { label: "20-yard sprint (test)", metric: "time", unit: "seconds", targetDescription: "-3 to -5% from baseline" },
        { label: "Squat 1RM (estimate)", metric: "weight", unit: "lb", targetDescription: "+5-10% from start" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY A — ME Lower (Squat dominant)
    // ===========================================================
    {
      name: "Day A — ME Lower",
      type: "lifting",
      slots: [
        // Power first
        {
          category: "power",
          role: "power",
          primary: "Box Jump - Bodyweight",
          alt1: "Jump Squat - Bodyweight",
          alt2: "Broad Jump - Bodyweight",
          notes: "POWER FIRST. 3-5 reps, full recovery between (90s+). Go for height/distance.",
        },
        // Max Effort lift
        {
          category: "squat",
          role: "compound",
          primary: "Squat - High Bar Barbell",
          alt1: "Squat - Front Barbell",
          alt2: "Squat - Box Barbell",
          notes: "MAX EFFORT. Build to a heavy 3-5 (not 1RM). RPE 8-9. 3-min rest.",
        },
        // Posterior chain volume
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Barbell",
          alt1: "Deadlift - Romanian Dumbbell",
          alt2: "Deadlift - Smith Machine Romanian",
        },
        // Single leg
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Bulgarian Split Squat Dumbbell",
          alt1: "Lunge - Reverse Bodyweight",
          alt2: "Step-Up - Dumbbell",
          notes: "10/leg",
        },
        // Hip stability
        {
          category: "core",
          role: "isolation",
          primary: "Lateral Walk - Band",
          alt1: "Standing Hip Abduction - Cable",
          alt2: "Side Lying Leg Raise - Bodyweight",
          notes: "Hip abduction stability — 10-12/side.",
        },
        // Carry finisher
        {
          category: "core",
          role: "compound",
          primary: "Farmer's Walk - Dumbbell",
          alt1: "Farmer's Walk - Kettlebell",
          alt2: "Bear Crawl - Bodyweight",
          notes: "40s walks. Heavy.",
        },
      ],
      perBlockParams: [
        // Block 1
        [
          { sets: 4, reps: 3, progressionType: "linear", progressionIncrement: 0, notesOverride: "3 reps x 4 sets, full recovery" },
          { sets: 4, reps: 5, rpe: 8, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 78 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg" },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0, notesOverride: "12/side" },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5, notesOverride: "40s walks" },
        ],
        // Block 2
        [
          { sets: 5, reps: 3, progressionType: "linear", progressionIncrement: 0, notesOverride: "Add small box increase if box jump" },
          { sets: 5, reps: 3, rpe: 8, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 85 },
          { sets: 3, reps: 6, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 8, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg, dumbbells" },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0, notesOverride: "12/side" },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5 },
        ],
        // Block 3
        [
          { sets: 4, reps: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "Maximal — 2 reps, 2-min rest. Test height/distance." },
          { sets: 3, reps: 2, rpe: 9, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 90, notesOverride: "Heavy doubles" },
          { sets: 2, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 5, notesOverride: "6/leg" },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 30, progressionType: "linear", progressionIncrement: 0, notesOverride: "Lighter — recovery focus" },
        ],
      ],
    },

    // ===========================================================
    // DAY B — ME Upper (Bench dominant)
    // ===========================================================
    {
      name: "Day B — ME Upper",
      type: "lifting",
      slots: [
        // Power first
        {
          category: "power",
          role: "power",
          primary: "Medicine Ball Slam",
          alt1: "Medicine Ball Chest Pass",
          alt2: "Medicine Ball Overhead Throw",
          notes: "POWER FIRST. 5 reps, max intent. 90s rest.",
        },
        // Max Effort
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Bench Press - Flat Barbell",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Chest Press - Plate-Load",
          notes: "MAX EFFORT. 4-6 reps top set RPE 8-9. 3-min rest.",
        },
        // Pull volume (balance)
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Bent Over Barbell",
          alt1: "Row - Single Arm Dumbbell",
          alt2: "Row - Seated Cable",
        },
        // Vertical push
        {
          category: "vertical_push",
          role: "accessory",
          primary: "Overhead Press - Standing Dumbbell",
          alt1: "Overhead Press - Seated Dumbbell",
          alt2: "Shoulder Press - Plate-Load",
          notes: "Standing — challenges core stability.",
        },
        // Vertical pull
        {
          category: "vertical_pull",
          role: "accessory",
          primary: "Pull-Ups - Bodyweight",
          alt1: "Pulldowns - Cable",
          alt2: "Chin-Ups - Assisted Machine",
        },
        // Anti-rotation core
        {
          category: "core",
          role: "isolation",
          primary: "Pallof Press - Cable",
          alt1: "Wood Chop - Cable",
          alt2: "Pallof Press - Band",
          notes: "10/side",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 5, progressionType: "linear", progressionIncrement: 0, notesOverride: "Full recovery between throws" },
          { sets: 4, reps: 6, rpe: 7, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 78 },
          { sets: 4, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: "AMRAP", rpe: 8, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 10, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
        [
          { sets: 5, reps: 4, progressionType: "linear", progressionIncrement: 0 },
          { sets: 5, reps: 4, rpe: 8, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 85 },
          { sets: 4, reps: 6, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 4, reps: 6, rpe: 8, progressionType: "linear", progressionIncrement: 0, notesOverride: "Weighted if able" },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 4, reps: 3, progressionType: "linear", progressionIncrement: 0, notesOverride: "Max intent" },
          { sets: 3, reps: 2, rpe: 9, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 90 },
          { sets: 3, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 8, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 0, notesOverride: "Weighted if able" },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },

    // ===========================================================
    // DAY C — DE Lower (Dynamic Effort + Sprints)
    // ===========================================================
    {
      name: "Day C — DE Lower + Sprints",
      type: "lifting",
      slots: [
        // KB swings as DE hinge
        {
          category: "power",
          role: "power",
          primary: "Kettlebell Swing - Two Arm",
          alt1: "Kettlebell Swing - American",
          alt2: "Hang Clean - Kettlebell",
          notes: "POWER. 8-10 reps, explosive. 60s rest. (Replaces sprint warmup if no track.)",
        },
        // Dynamic Effort squat — fast bar speed at moderate load
        {
          category: "squat",
          role: "compound",
          primary: "Squat - Box Barbell",
          alt1: "Squat - High Bar Barbell",
          alt2: "Squat - Goblet Dumbbell",
          notes: "DYNAMIC EFFORT. 8 sets x 2 reps at 60-70% 1RM, FAST bar speed. 60s rest.",
        },
        // Hex bar deadlift volume
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Hex Bar",
          alt1: "Deadlift - Conventional Barbell",
          alt2: "Deadlift - Romanian Barbell",
          notes: "Sub-max load. Build hinge volume without ME stress.",
        },
        // Hamstring isolation
        {
          category: "hamstring",
          role: "isolation",
          primary: "Leg Curl - Machine",
          alt1: "Nordic Curl - Assisted Bodyweight",
          alt2: "Glute Bridge - Single Leg Bodyweight",
        },
        // Glutes
        {
          category: "hip_extension",
          role: "compound",
          primary: "Hip Thrust - Barbell",
          alt1: "Hip Thrust - Dumbbell",
          alt2: "Cable Pull-Through",
        },
        // Sprints (logged as time/distance, not sets/reps)
        {
          category: "conditioning",
          role: "power",
          primary: "Farmer's Walk - Single Arm Dumbbell",
          alt1: "Bear Crawl - Bodyweight",
          alt2: "Farmer's Walk - Kettlebell",
          notes: "SPRINTS PROGRAM (off-program if track unavailable, sub farmer's walks). Block 1: 6x20yd technique. Block 2: 6x40yd full speed. Block 3: 4x40yd test pace.",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 10, progressionType: "linear", progressionIncrement: 0 },
          { sets: 8, reps: 2, progressionType: "percentage_based", progressionIncrement: 0, loadPercent: 60, notesOverride: "Fast bar speed — RPE 5-6 max" },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 6, reps: 20, progressionType: "linear", progressionIncrement: 0, notesOverride: "20yd technique sprints OR 30s farmer's walks" },
        ],
        [
          { sets: 5, reps: 10, progressionType: "linear", progressionIncrement: 0 },
          { sets: 8, reps: 2, progressionType: "percentage_based", progressionIncrement: 0, loadPercent: 65, notesOverride: "FAST" },
          { sets: 3, reps: 6, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rpe: 8, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 8, progressionType: "linear", progressionIncrement: 5 },
          { sets: 6, reps: 40, progressionType: "linear", progressionIncrement: 0, notesOverride: "40yd full speed sprints, 90s rest" },
        ],
        [
          { sets: 4, reps: 8, progressionType: "linear", progressionIncrement: 0 },
          { sets: 6, reps: 2, progressionType: "percentage_based", progressionIncrement: 0, loadPercent: 70, notesOverride: "FAST — fewer sets, higher quality" },
          { sets: 2, reps: 5, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 2, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 4, reps: 40, progressionType: "linear", progressionIncrement: 0, notesOverride: "TEST: 4x40yd at full speed, 2-min rest" },
        ],
      ],
    },

    // ===========================================================
    // DAY D — DE Upper (Dynamic Effort)
    // ===========================================================
    {
      name: "Day D — DE Upper",
      type: "lifting",
      slots: [
        // Power
        {
          category: "power",
          role: "power",
          primary: "Medicine Ball Chest Pass",
          alt1: "Medicine Ball Slam",
          alt2: "Medicine Ball Overhead Throw",
          notes: "POWER. 5 reps explosive. 60s rest.",
        },
        // DE bench
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Bench Press - Flat Barbell",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Chest Press - Plate-Load",
          notes: "DYNAMIC EFFORT. 8 sets x 3 reps at 60-70%, FAST. 60s rest.",
        },
        // Pull volume
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Chest Supported Dumbbell",
          alt1: "Row - Bent Over Barbell",
          alt2: "Row - Seated Cable",
        },
        // Lateral delts
        {
          category: "lateral_delt",
          role: "isolation",
          primary: "Cable Raise - Lateral Cable",
          alt1: "Dumbbell Lateral Raise",
          alt2: "Lateral Raise - Band",
        },
        // Triceps
        {
          category: "tricep",
          role: "isolation",
          primary: "Tricep Pressdown - Cable",
          alt1: "Tricep Extension - Overhead Dumbbell",
          alt2: "Close Grip Push-Up - Bodyweight",
        },
        // Carry
        {
          category: "core",
          role: "compound",
          primary: "Overhead Carry - Dumbbell",
          alt1: "Overhead Carry - Kettlebell",
          alt2: "Waiter Walk - Dumbbell",
          notes: "Overhead carry — shoulder stability + anti-extension core.",
        },
      ],
      perBlockParams: [
        [
          { sets: 4, reps: 5, progressionType: "linear", progressionIncrement: 0 },
          { sets: 8, reps: 3, progressionType: "percentage_based", progressionIncrement: 0, loadPercent: 60, notesOverride: "FAST — RPE 5-6" },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 15, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 30, progressionType: "linear", progressionIncrement: 0, notesOverride: "30s walks" },
        ],
        [
          { sets: 5, reps: 5, progressionType: "linear", progressionIncrement: 0 },
          { sets: 8, reps: 3, progressionType: "percentage_based", progressionIncrement: 0, loadPercent: 65, notesOverride: "FAST" },
          { sets: 3, reps: 8, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5, notesOverride: "40s walks heavier" },
        ],
        [
          { sets: 4, reps: 3, progressionType: "linear", progressionIncrement: 0 },
          { sets: 6, reps: 3, progressionType: "percentage_based", progressionIncrement: 0, loadPercent: 70, notesOverride: "FAST — fewer sets" },
          { sets: 2, reps: 8, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 30, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Conditioning is its own thing for athletes — see the conditioningGuidance below. Outside of structured conditioning: 8-10k daily steps. Optional 1x/week Z2 walk/bike (30 min) on the off-day for active recovery.",
  conditioningGuidance:
    "PRESCRIBED, not optional. Block 1 (general prep): 2x/week — Day 1: alactic intervals (10s on / 50s off x 8). Day 2: aerobic Z2 (30 min bike/ruck). Block 2 (specific prep): 2x/week — Day 1: repeat sprint protocol (8x40yd, 90s rest). Day 2: tempo intervals (60s on / 90s off x 6). Block 3 (realization): 1x/week tempo only. Skip in week 12 (test week).",
  mobilityGuidance:
    "10-min pre-session warmup tailored per day: ME days = movement prep + activation. DE days = full dynamic warmup. Post-session: 5-min static cooldown focused on hips, ankles, T-spine. 1x/week 20-min standalone mobility session (yoga / mobility flow / contralateral patterning).",
  lifestyleGuidance:
    "Sleep 8 hr — power output is the FIRST thing to suffer with poor sleep. Track resting HR daily (5+ bpm above baseline = back off conditioning). Track jump height with phone app weekly to monitor recovery. No alcohol the night before sprint days. Foam roll IT band, calves, T-spine 3x/week.",

  customizationInputs: [
    {
      key: "sport_focus",
      label: "Primary sport / activity",
      type: "select",
      required: false,
      options: [
        { value: "general", label: "General athleticism" },
        { value: "team_field", label: "Team field sport (soccer, lacrosse, ultimate)" },
        { value: "team_court", label: "Team court sport (basketball, volleyball)" },
        { value: "combat", label: "Combat sport (BJJ, boxing, MMA)" },
        { value: "racing", label: "Endurance / hybrid (running, cycling, OCR)" },
        { value: "other", label: "Other / unspecified" },
      ],
      defaultValue: "general",
      helpText: "Drives conditioning emphasis (alactic vs aerobic).",
    },
    {
      key: "days_per_week",
      label: "Days per week",
      type: "select",
      required: true,
      options: [
        { value: "4", label: "4 days (recommended)" },
        { value: "5", label: "5 days (adds extra conditioning day)" },
      ],
      defaultValue: "4",
    },
    {
      key: "current_squat_1rm",
      label: "Current Squat 1RM (lb) — estimate is fine",
      type: "number",
      required: false,
    },
    {
      key: "current_bench_1rm",
      label: "Current Bench Press 1RM (lb) — estimate is fine",
      type: "number",
      required: false,
    },
    {
      key: "sprint_access",
      label: "Sprint setup access?",
      type: "select",
      required: true,
      options: [
        { value: "track", label: "Track / open field — can sprint" },
        { value: "treadmill", label: "Treadmill / sled only" },
        { value: "none", label: "None — sub farmer's walks for sprints" },
      ],
      defaultValue: "none",
    },
    {
      key: "plyometric_experience",
      label: "Plyometric experience",
      type: "select",
      required: true,
      options: [
        { value: "novice", label: "Novice — start with low boxes / submaximal" },
        { value: "experienced", label: "Experienced — full intensity from week 1" },
      ],
      defaultValue: "novice",
    },
    {
      key: "competition_date",
      label: "Competition / season start date (optional)",
      type: "date",
      required: false,
      helpText: "Drives Block 3 timing — week 12 should align ~1-2 weeks before competition.",
    },
    {
      key: "injuries",
      label: "Any current injuries?",
      type: "multi_select",
      required: false,
      options: [
        { value: "knee", label: "Knee" },
        { value: "ankle", label: "Ankle" },
        { value: "shoulder", label: "Shoulder" },
        { value: "lower_back", label: "Lower back" },
        { value: "hip", label: "Hip" },
      ],
    },
  ],

  engineWarnings: [
    {
      trigger: "User reports active knee or ankle injury",
      message: "Plyometrics and sprints stress lower-extremity joints. Run Comeback first to rebuild safely.",
      severity: "warning",
    },
    {
      trigger: "User reports <1 year consistent training",
      message: "Athletic Foundations assumes a strength base. Run First 90 Days or Size & Strength first.",
      severity: "warning",
    },
    {
      trigger: "Plyometric experience is 'novice'",
      message: "Block 1 will use submaximal jumps (lower boxes, easier landings). Don't push for height in week 1.",
      severity: "info",
    },
    {
      trigger: "Sprint access is 'none'",
      message: "Sprints will be substituted with weighted carries. You'll lose some sport-specific transfer but the program still works.",
      severity: "info",
    },
    {
      trigger: "User wants fat loss simultaneously",
      message: "Power output and fat loss don't pair well. Run Athletic Foundations at maintenance, cut afterward with Lean Out.",
      severity: "info",
    },
  ],

  variantNotes:
    "5-day variant: adds a 5th day of conditioning + mobility (no extra lifts). For sport-specific transfer: combat sports get more grip / carry work, endurance athletes get longer aerobic blocks, court sports get more lateral plyo work. Test week 12 jump test order: 1) Box jump (height), 2) Broad jump (distance), 3) 20-yd sprint (time). Full recovery between.",
};
