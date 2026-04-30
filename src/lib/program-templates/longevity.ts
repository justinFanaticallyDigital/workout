import type { ProgramTemplate } from "./types";

/**
 * Longevity — 12 weeks recurring, 3-4x/week DUP, balance / Z2 / VO2 max.
 *
 * For someone 40+ training for healthspan: maintain muscle mass, preserve bone
 * density, build cardiovascular reserve, train balance and reaction time.
 * Daily Undulating Periodization keeps stimulus varied without grinding joints.
 *
 * Block 1 — Build (weeks 1-4): establish DUP rotation, baseline conditioning
 * Block 2 — Sustain (weeks 5-8): same loads with VO2 max work introduced
 * Block 3 — Maintain (weeks 9-12): hold gains, balance challenges progress
 *
 * Designed to be RE-RUN. Block 4-6 of the next cycle can re-test or extend.
 * Includes balance work, single-leg stability, and Z2 + VO2 max cardio (Norwegian
 * 4x4 protocol). Carries replace traditional core work for grip + posture support.
 */

export const longevity: ProgramTemplate = {
  slug: "longevity",
  name: "Longevity",
  tagline: "Train for the next 30 years. Strength, balance, breath.",
  description:
    "A 12-week program for adults 40+ training for healthspan, not Instagram. The big 3 stay (muscle mass and bone density are non-negotiable after 40), but volume is moderate, joints are protected, and the cardio is split between Z2 (aerobic base) and VO2 max (mortality-curve hero). Balance, single-leg stability, and grip work are programmed because falling is the #1 long-term threat. Designed to repeat — finish 12 weeks, repeat.",

  experienceLevel: "any",
  durationWeeks: 12,
  defaultDaysPerWeek: 3,
  daysPerWeekRange: [3, 4],
  sessionLengthMin: 50,
  sessionLengthMax: 70,
  equipment: "full_gym",
  periodization: "Daily Undulating Periodization (heavy / light / volume rotation)",
  goalWeighting: { strength: 30, cardio: 30, balance: 20, muscle: 20 },

  blocks: [
    {
      name: "Build",
      weekStart: 1,
      weekEnd: 4,
      phase: "accumulation",
      description:
        "Establish the DUP rotation. Day A = strength (4-6 reps), Day B = volume (8-12), Day C = light/balance. Z2 cardio built in.",
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        carbsPerLb: 1.5,
        notes:
          "Protein 1g/lb — non-negotiable after 40 to preserve muscle. Calcium-rich foods (dairy, leafy greens) for bone. Mediterranean-style framework: 5+ veg/day, fish 2x/week, olive oil base, limited red meat.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 12, targetDescription: "12 of 12 sessions" },
        { label: "Z2 cardio", metric: "time", unit: "min", targetValue: 60, targetDescription: "60+ min Z2 per week" },
        { label: "Single-leg balance test", metric: "time", unit: "seconds", targetValue: 30, targetDescription: "30+ seconds eyes open" },
      ],
    },
    {
      name: "Sustain",
      weekStart: 5,
      weekEnd: 8,
      phase: "intensification",
      description:
        "Same DUP rotation, slight load increases. VO2 max work introduced 1x/week (Norwegian 4x4). Balance progressions add eyes-closed challenges.",
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        carbsPerLb: 1.5,
        notes:
          "Maintenance. Protein still 1g/lb. Add a 30-min eating window post-VO2 max session for performance fueling.",
      },
      benchmarks: [
        { label: "Squat top set", metric: "weight", unit: "lb", targetDescription: "+5-10 lb from week 4" },
        { label: "Bench top set", metric: "weight", unit: "lb", targetDescription: "+5 lb" },
        { label: "VO2 max sessions", metric: "custom", unit: "sessions", targetValue: 4, targetDescription: "4 of 4 (1x/week)" },
        { label: "Single-leg balance (eyes closed)", metric: "time", unit: "seconds", targetValue: 15, targetDescription: "15+ seconds" },
      ],
    },
    {
      name: "Maintain",
      weekStart: 9,
      weekEnd: 12,
      phase: "intensification",
      description:
        "Hold strength gains. Refine technique. Cardio steady at 2-3 sessions/week. Week 12 is a calibration week — re-test balance, Z2 capacity, top sets.",
      nutritionTarget: {
        calories: "maintenance",
        proteinPerLb: 1.0,
        carbsPerLb: 1.5,
        notes:
          "Same. If you're losing weight unintentionally, bump calories slightly — sarcopenia is a bigger risk than a few extra lbs after 40.",
      },
      benchmarks: [
        { label: "Squat top set retest", metric: "weight", unit: "lb", targetDescription: "+10-15 lb from start" },
        { label: "RHR avg", metric: "custom", unit: "bpm", targetDescription: "Trending lower from start" },
        { label: "Single-leg balance (eyes closed)", metric: "time", unit: "seconds", targetValue: 30, targetDescription: "30+ seconds" },
        { label: "Sessions completed total", metric: "custom", unit: "sessions", targetValue: 36, targetDescription: "36 of 36 across 12 weeks" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY A — Strength (DUP heavy day: 4-6 reps)
    // ===========================================================
    {
      name: "Day A — Strength",
      type: "lifting",
      slots: [
        // Squat — strength bias
        {
          category: "squat",
          role: "compound",
          primary: "Squat - Goblet Dumbbell",
          alt1: "Squat - Front Barbell",
          alt2: "Leg Press - Machine",
          notes:
            "Goblet first — joint-friendly, teaches upright torso. Move to barbell back/front squat in Block 2 if comfortable. 4-6 reps — heavy but safe.",
        },
        // Hinge
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Dumbbell",
          alt1: "Deadlift - Hex Bar",
          alt2: "Deadlift - Romanian Single Leg Dumbbell",
          notes: "RDL first — kinder on the back than conventional. Hex bar in Block 2-3 if interested.",
        },
        // Push
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Bench Press - Flat Dumbbell",
          alt1: "Chest Press - Machine",
          alt2: "Bench Press - Flat Barbell",
          notes: "Dumbbells first — shoulder-friendlier. Barbell only if no shoulder issues.",
        },
        // Pull
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Single Arm Dumbbell",
          alt1: "Row - Seated Cable",
          alt2: "Row - Chest Supported Dumbbell",
          notes: "Single-arm row trains anti-rotation core simultaneously. 8/side.",
        },
        // Carry (replaces traditional core)
        {
          category: "core",
          role: "compound",
          primary: "Farmer's Walk - Dumbbell",
          alt1: "Farmer's Walk - Kettlebell",
          alt2: "Farmer's Walk - Single Arm Dumbbell",
          notes: "Carry — grip strength + posture. Walk 30-40s. Heavy as you can hold.",
        },
        // Balance
        {
          category: "core",
          role: "isolation",
          primary: "Side Lying Leg Raise - Bodyweight",
          alt1: "Clamshell - Band",
          alt2: "Bird Dog - Bodyweight",
          notes: "Hip stability finisher. 10-12/side.",
        },
      ],
      perBlockParams: [
        // Block 1
        [
          { sets: 4, reps: 5, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 6, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 6, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 6, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "6/side" },
          { sets: 3, reps: 30, progressionType: "linear", progressionIncrement: 5, notesOverride: "30s walks" },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 2
        [
          { sets: 4, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Move to barbell if confident" },
          { sets: 3, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "Hex bar option" },
          { sets: 3, reps: 6, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/side" },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5, notesOverride: "40s walks" },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 3
        [
          { sets: 4, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 5, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 40, progressionType: "linear", progressionIncrement: 5, notesOverride: "40s walks heavier" },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },

    // ===========================================================
    // DAY B — Volume (DUP volume day: 8-12 reps)
    // ===========================================================
    {
      name: "Day B — Volume",
      type: "lifting",
      slots: [
        // Pull
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pulldowns - Cable",
          alt1: "Pull-Ups - Assisted Machine",
          alt2: "Pulldown - Plate-Load",
          notes: "Cable lat pulldown — controlled, joint-friendly.",
        },
        // Push
        {
          category: "vertical_push",
          role: "accessory",
          primary: "Overhead Press - Seated Dumbbell",
          alt1: "Shoulder Press - Machine",
          alt2: "Landmine Press - Kneeling",
          notes: "Seated overhead — safer than standing for older lifters with low back / balance issues.",
        },
        // Single-leg quad
        {
          category: "lunge",
          role: "compound",
          primary: "Step-Up - Dumbbell",
          alt1: "Lunge - Reverse Bodyweight",
          alt2: "Lunge - Lateral Bodyweight",
          notes: "Step-ups — knee-friendly, balance challenge built in. 10/leg.",
        },
        // Glute
        {
          category: "hip_extension",
          role: "compound",
          primary: "Hip Thrust - Dumbbell",
          alt1: "Glute Bridge - Banded",
          alt2: "Hip Thrust - Banded",
        },
        // Bicep + tricep antagonist superset
        {
          category: "bicep",
          role: "isolation",
          primary: "Curl - Dumbbell",
          alt1: "Curl - Cable",
          alt2: "Curl - Hammer Dumbbell",
          notes: "Superset with tricep extensions. 10-12 reps.",
        },
        {
          category: "tricep",
          role: "isolation",
          primary: "Tricep Extension - Overhead Dumbbell",
          alt1: "Tricep Pressdown - Cable",
          alt2: "Tricep Press - TRX",
          notes: "Superset with curls.",
        },
      ],
      perBlockParams: [
        [
          { sets: 3, reps: 10, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/leg" },
          { sets: 3, reps: 12, rir: 2, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg, dumbbells" },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 4, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 1, progressionType: "double", progressionIncrement: 5 },
        ],
      ],
    },

    // ===========================================================
    // DAY C — Light/Balance (DUP light day: 12-15 reps + balance)
    // ===========================================================
    {
      name: "Day C — Light + Balance",
      type: "lifting",
      slots: [
        // Light front squat — balance challenge
        {
          category: "squat",
          role: "compound",
          primary: "Squat - Goblet Dumbbell",
          alt1: "Squat - Smith Machine",
          alt2: "Leg Press - Machine",
          notes: "Light load (60% of Day A). Slow tempo: 3 down / 1 up.",
        },
        // Lateral lunge — frontal plane
        {
          category: "lunge",
          role: "accessory",
          primary: "Lunge - Lateral Dumbbell",
          alt1: "Lunge - Lateral Bodyweight",
          alt2: "Lunge - Curtsy Bodyweight",
          notes: "Lateral lunges — train the frontal plane (often missing from programs). 10/side.",
        },
        // Single-leg RDL — major balance challenge
        {
          category: "hinge",
          role: "accessory",
          primary: "Deadlift - Romanian Single Leg Dumbbell",
          alt1: "Deadlift - Romanian Single Leg Kettlebell",
          alt2: "Band Pull-Through",
          notes: "Single-leg RDL is the #1 fall-prevention movement. 8/leg, slow.",
        },
        // Pushup — bodyweight pressing
        {
          category: "horizontal_push",
          role: "accessory",
          primary: "Push-Up - Standard Bodyweight",
          alt1: "Push-Up - TRX",
          alt2: "Bench Press - Flat Dumbbell",
          notes: "Bodyweight push — controlled. AMRAP option.",
        },
        // Face pull — postural
        {
          category: "rear_delt",
          role: "isolation",
          primary: "Face Pull - Cable",
          alt1: "Face Pull - Band",
          alt2: "Cable Raise - Rear Delt Cable",
          notes: "Postural support. Combats forward head / rounded shoulders.",
        },
        // Balance + core finisher
        {
          category: "core",
          role: "isolation",
          primary: "Bird Dog - Bodyweight",
          alt1: "Dead Bug - Bodyweight",
          alt2: "Plank - Side Bodyweight",
          notes: "Anti-extension/anti-rotation. 10/side or 30s/side hold.",
        },
      ],
      perBlockParams: [
        [
          { sets: 3, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
          { sets: 2, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 0, notesOverride: "8/leg" },
          { sets: 3, reps: "AMRAP", rir: 1, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 2, reps: 10, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/side" },
        ],
        [
          { sets: 3, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/side, dumbbells" },
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg, slow tempo, EYES CLOSED middle 2 reps" },
          { sets: 3, reps: "AMRAP", rir: 0, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
        [
          { sets: 3, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rir: 2, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rir: 2, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg, EYES CLOSED entire set" },
          { sets: 3, reps: "AMRAP", rir: 0, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 15, rir: 1, progressionType: "linear", progressionIncrement: 2.5 },
          { sets: 3, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },
  ],

  cardioGuidance:
    "TWO MODALITIES, both prescribed. Z2 (aerobic base): 2-3x/week 30-45 min, easy pace where you can hold conversation, on bike / treadmill / rower / outdoor walk. Builds mitochondrial density — most important for longevity. VO2 MAX (Norwegian 4x4): introduced Block 2, 1x/week. 4 minutes hard (~95% max HR) / 3 min easy x 4. 30-min total session including warmup/cooldown. The single most studied longevity protocol — do not skip. Keeps cardiac output high.",
  conditioningGuidance:
    "The carry work in Day A IS the conditioning. No additional metabolic finishers — recovery is more important.",
  mobilityGuidance:
    "10-min daily mobility routine (separate from sessions). Hips, T-spine, ankles. Foam roll IT band, calves, lats, T-spine 4x/week. Annual flexibility test: sit-and-reach, shoulder-flexion, ankle dorsiflexion. Track decline.",
  lifestyleGuidance:
    "Sleep 7-9 hr — same as everyone else, BUT consistency of bedtime matters more after 40. Track resting HR, weekly weigh-ins (don't chase scale movement — tissue change is what matters). Daily steps 8-10k. Annual bloodwork (lipid panel, A1c, ferritin, vitamin D, testosterone if male, thyroid). DEXA scan every 2 years if budget allows. Bone density should be a hard metric for women post-menopause and men 50+. NO ALCOHOL within 4 hr of bed — breaks sleep architecture more aggressively as you age. Hydration check: pee should be light yellow, not clear (over-hydration also a problem).",

  customizationInputs: [
    {
      key: "age",
      label: "Age",
      type: "number",
      required: true,
      helpText: "Drives benchmark scaling and warning thresholds.",
    },
    {
      key: "menopause_status",
      label: "Menopause status (if applicable)",
      type: "select",
      required: false,
      options: [
        { value: "premenopausal", label: "Premenopausal" },
        { value: "perimenopausal", label: "Perimenopausal" },
        { value: "postmenopausal", label: "Postmenopausal" },
        { value: "na", label: "N/A" },
      ],
      defaultValue: "na",
      helpText: "Postmenopausal — we'll bump protein to 1.1g/lb and emphasize bone-loading exercises.",
    },
    {
      key: "training_history",
      label: "Lifting history",
      type: "select",
      required: true,
      options: [
        { value: "novice", label: "Novice — never trained consistently" },
        { value: "lapsed", label: "Lapsed — used to lift, returning" },
        { value: "consistent", label: "Consistent — never really stopped" },
      ],
    },
    {
      key: "current_squat",
      label: "Current Squat working weight (lb) — optional",
      type: "number",
      required: false,
    },
    {
      key: "current_bench",
      label: "Current Bench working weight (lb) — optional",
      type: "number",
      required: false,
    },
    {
      key: "cardio_baseline",
      label: "Current cardio baseline",
      type: "select",
      required: true,
      options: [
        { value: "none", label: "None — sedentary outside of work" },
        { value: "walks", label: "Walking only" },
        { value: "regular", label: "Regular cardio (some kind, 2+ x/week)" },
      ],
      defaultValue: "walks",
    },
    {
      key: "joint_history",
      label: "Joint / orthopedic history",
      type: "multi_select",
      required: false,
      options: [
        { value: "knee_replacement", label: "Knee replacement" },
        { value: "hip_replacement", label: "Hip replacement" },
        { value: "back_surgery", label: "Back surgery" },
        { value: "shoulder_surgery", label: "Shoulder surgery" },
        { value: "arthritis", label: "Arthritis (any)" },
        { value: "osteoporosis", label: "Osteoporosis / osteopenia" },
        { value: "none", label: "None" },
      ],
      helpText: "Drives exercise substitutions. Joint replacement = no high-impact, follow surgeon clearance.",
    },
    {
      key: "balance_baseline",
      label: "Single-leg balance test (eyes open, seconds)",
      type: "select",
      required: false,
      options: [
        { value: "<10", label: "Under 10s" },
        { value: "10-30", label: "10-30s" },
        { value: ">30", label: "Over 30s" },
      ],
      helpText: "Standard fall-risk screening. Under 10s = high priority on balance work.",
    },
  ],

  engineWarnings: [
    {
      trigger: "Age 65+ with no lifting history",
      message: "Welcome — you'll see fast gains. Run Block 1 with extra caution: drop sets by 1, reps by 2 across the board. Better to ease in.",
      severity: "info",
    },
    {
      trigger: "Single-leg balance baseline under 10s",
      message: "High fall risk indicator. We'll prioritize balance work in Day C with extra sets. Consider a separate balance practice (yoga, tai chi) on off-days.",
      severity: "warning",
    },
    {
      trigger: "User reports osteoporosis / osteopenia",
      message: "BONE LOADING IS YOUR PRIMARY TOOL — this program is right for you. We'll keep heavy compound lifts and avoid spinal flexion.",
      severity: "info",
    },
    {
      trigger: "User reports back surgery",
      message: "We'll skip conventional deadlift, sub RDL with limited range. Coordinate with your surgeon on lifting clearance.",
      severity: "warning",
    },
    {
      trigger: "Goal is rapid fat loss",
      message: "Aggressive cuts after 40 risk muscle loss — and muscle loss after 40 is hard to reverse. Stay at maintenance, prioritize body composition through training.",
      severity: "warning",
    },
  ],

  variantNotes:
    "3-day variant: skip Day C in lower-energy weeks, replace with 30-min Z2 walk. 4-day variant: add a 4th day = pure cardio + balance (30 min Z2, 10 min balance circuit). Designed to be RE-RUN — finish 12 weeks, then re-test benchmarks and run another 12-week cycle. Or transition to Size & Strength if strength becomes the new priority. After age 65: reduce all top-set loads by 10%, extend rest periods.",

  // R13 — spec §7 per-gameplan lifestyle picks. Seeded as 3
  // LifestyleTarget rows server-side after clone.
  defaultLifestylePicks: [
    { key: "sleep_duration", value: 7.5, unit: "hours", comparator: "gte" },
    { key: "z2_minutes", value: 150, unit: "min", comparator: "gte" },
    { key: "balance_minutes", value: 20, unit: "min", comparator: "gte" },
  ],

  // R13 — refeed cadence in weeks within each block. Lean Out only;
  // null for everything else.
  defaultRefeedCadence: null,
};
