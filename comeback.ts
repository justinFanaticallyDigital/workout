import type { ProgramTemplate } from "./types";

/**
 * Comeback — 12 weeks, 2→3 sessions/week, reverse linear, joint-friendly first.
 *
 * For someone returning from injury, surgery, or a long lifting break (6+ months).
 * The defining principle: prove tolerance before adding load. Pain (not performance)
 * is the primary feedback signal.
 *
 * Block 1 — Re-engage (weeks 1-4): 2x/week, machines + DBs only, RPE 6 ceiling
 * Block 2 — Rebuild (weeks 5-8): 3x/week, introduce barbell variations, RPE 7 ceiling
 * Block 3 — Restore (weeks 9-12): 3x/week, light percentages on big lifts, hand off to next program
 *
 * Movements are exclusively low-impact: no plyos, no sprints, no max effort.
 * Daily 1-10 pain check drives every load decision.
 */

export const comeback: ProgramTemplate = {
  slug: "comeback",
  name: "Comeback",
  tagline: "Back to lifting. Carefully. Sustainably. Without re-injury.",
  description:
    "A 12-week program for returning to lifting after injury, surgery, or a long break (6+ months off). Movement comes before load: machine and dumbbell variations first, barbell only when joints are quiet. Pain (not performance) drives every decision — daily 1-10 pain check determines whether to push, hold, or back off. The goal isn't a PR; it's getting back to a lifestyle of training without re-injury.",

  experienceLevel: "any",
  durationWeeks: 12,
  defaultDaysPerWeek: 3,
  daysPerWeekRange: [2, 3],
  sessionLengthMin: 45,
  sessionLengthMax: 60,
  equipment: "full_gym",
  periodization: "Reverse linear (build frequency before intensity)",
  goalWeighting: { recovery: 50, tissue_capacity: 30, habit: 20 },

  blocks: [
    {
      name: "Re-engage",
      weekStart: 1,
      weekEnd: 4,
      phase: "re_engage",
      description:
        "2 sessions/week. Machine and dumbbell variations only. RPE 6 ceiling — leave 4 reps in the tank. Daily pain check. The goal: prove tolerance.",
      nutritionTarget: {
        proteinPerLb: 1.0,
        notes:
          "Protein 1g/lb supports tissue repair. Don't cut calories — recovery needs energy. Add a fish oil + creatine if not already.",
      },
      benchmarks: [
        { label: "Sessions completed (no flare-up)", metric: "custom", unit: "sessions", targetValue: 8, targetDescription: "8 of 8 sessions, no pain >3/10" },
        { label: "Daily pain rating (avg)", metric: "custom", unit: "1-10", targetDescription: "Stable or trending down" },
        { label: "Sleep quality", metric: "custom", unit: "1-5", targetDescription: "Improving subjectively" },
      ],
    },
    {
      name: "Rebuild",
      weekStart: 5,
      weekEnd: 8,
      phase: "rebuild",
      description:
        "3 sessions/week if Block 1 went well. Introduce barbell variations on healthy patterns. RPE 7 ceiling. Pain rules unchanged: stop if any movement crosses 4/10.",
      nutritionTarget: {
        proteinPerLb: 1.0,
        calories: "maintenance",
        notes:
          "Maintenance calories. Protein still 1g/lb. Carbs around training. If sleep poor, prioritize fixing it before adding load.",
      },
      benchmarks: [
        { label: "Sessions completed", metric: "custom", unit: "sessions", targetValue: 12, targetDescription: "12 of 12 sessions" },
        { label: "Working weights", metric: "custom", unit: "subjective", targetDescription: "Returning toward pre-injury levels" },
        { label: "Pain rating", metric: "custom", unit: "1-10", targetDescription: "Avg ≤2/10" },
      ],
    },
    {
      name: "Restore",
      weekStart: 9,
      weekEnd: 12,
      phase: "restore",
      description:
        "Final 4 weeks. Light percentages on big lifts (60-75% if known). Build back conditioning slowly. By week 12 you should be ready to graduate to Size & Strength or another core program.",
      nutritionTarget: {
        proteinPerLb: 1.0,
        calories: "maintenance",
        notes:
          "Maintenance. Carbs for performance. If you're cleared by physical therapy, you can start a small surplus to support hypertrophy.",
      },
      benchmarks: [
        { label: "Pre-injury working weight", metric: "custom", unit: "subjective", targetDescription: "Within 80-90% on at least 2 of 3 big lifts" },
        { label: "Conditioning", metric: "time", unit: "min", targetValue: 25, targetDescription: "Z2 walk 25+ min, no pain" },
        { label: "Total sessions", metric: "custom", unit: "sessions", targetValue: 30, targetDescription: "30 of 32 (94%)" },
        { label: "Ready for full program?", metric: "custom", unit: "yes/no", targetDescription: "Subjective check — pain stable, motivation high" },
      ],
    },
  ],

  days: [
    // ===========================================================
    // DAY A — Lower (Hip Dominant)
    // ===========================================================
    {
      name: "Day A — Lower (Hip)",
      type: "lifting",
      slots: [
        // Hip-dominant compound (low impact, machine first)
        {
          category: "hip_extension",
          role: "compound",
          primary: "Hip Thrust - Machine",
          alt1: "Hip Thrust - Dumbbell",
          alt2: "Glute Bridge - Banded",
          notes:
            "Machine hip thrust first — easiest setup, lowest spinal load. Move to barbell only if comfortable in Block 3.",
        },
        // Light hinge (single-leg = lower load)
        {
          category: "hinge",
          role: "compound",
          primary: "Deadlift - Romanian Single Leg Dumbbell",
          alt1: "Deadlift - Romanian Single Leg Kettlebell",
          alt2: "Band Pull-Through",
          notes: "Single-leg RDL — teaches hinge with low absolute load. 8/leg.",
        },
        // Quad isolation (machine, joint-friendly)
        {
          category: "quad",
          role: "isolation",
          primary: "Leg Extension - Machine",
          alt1: "Leg Press - Machine",
          alt2: "Squat - Goblet Dumbbell",
          notes: "Leg extension — knee-friendly quad work without spinal load.",
        },
        // Hamstring isolation
        {
          category: "hamstring",
          role: "isolation",
          primary: "Leg Curl - Machine",
          alt1: "Glute Bridge - Single Leg Bodyweight",
          alt2: "Leg Curl - Banded",
        },
        // Core (anti-extension)
        {
          category: "core",
          role: "isolation",
          primary: "Dead Bug - Bodyweight",
          alt1: "Bird Dog - Bodyweight",
          alt2: "Plank - Standard Bodyweight",
          notes: "Anti-extension core. 10/side or 30s hold.",
        },
        // Hip stability
        {
          category: "core",
          role: "isolation",
          primary: "Clamshell - Band",
          alt1: "Side Lying Leg Raise - Bodyweight",
          alt2: "Lateral Walk - Band",
          notes: "Hip abductor activation. 12-15/side.",
        },
      ],
      perBlockParams: [
        // Block 1 — Re-engage (RPE 6 ceiling)
        [
          { sets: 3, reps: 10, rpe: 6, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 8, rpe: 6, progressionType: "linear", progressionIncrement: 0, notesOverride: "8/leg" },
          { sets: 3, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 0 },
          { sets: 3, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 0 },
          { sets: 2, reps: 10, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 15, progressionType: "linear", progressionIncrement: 0, notesOverride: "15/side" },
        ],
        // Block 2 — Rebuild (RPE 7 ceiling)
        [
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5, notesOverride: "8/leg" },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 15, progressionType: "linear", progressionIncrement: 0 },
        ],
        // Block 3 — Restore (RPE 7-8, light percentages)
        [
          { sets: 4, reps: 8, rpe: 7, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 70, notesOverride: "Move to barbell hip thrust if comfortable" },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, progressionType: "linear", progressionIncrement: 0 },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
        ],
      ],
    },

    // ===========================================================
    // DAY B — Upper (Push/Pull)
    // ===========================================================
    {
      name: "Day B — Upper",
      type: "lifting",
      slots: [
        // Pressing (machine first)
        {
          category: "horizontal_push",
          role: "compound",
          primary: "Chest Press - Machine",
          alt1: "Bench Press - Flat Dumbbell",
          alt2: "Push-Up - Standard Bodyweight",
          notes: "Machine first — fixed path, lower shoulder strain.",
        },
        // Rowing (cable, supported)
        {
          category: "horizontal_pull",
          role: "compound",
          primary: "Row - Seated Cable",
          alt1: "Row - Seated Machine",
          alt2: "Row - Chest Supported Dumbbell",
          notes: "Chest-supported variations to remove low-back load.",
        },
        // Pulldown
        {
          category: "vertical_pull",
          role: "compound",
          primary: "Pulldowns - Cable",
          alt1: "Pulldown - Plate-Load",
          alt2: "Pulldown - Band",
          notes: "Light. Full ROM is the goal, not the load.",
        },
        // Light press
        {
          category: "vertical_push",
          role: "accessory",
          primary: "Shoulder Press - Machine",
          alt1: "Overhead Press - Seated Dumbbell",
          alt2: "Shoulder Press - Smith Machine",
          notes: "Skip if shoulder is recently injured. Stop at first sign of pinching.",
        },
        // Bicep
        {
          category: "bicep",
          role: "isolation",
          primary: "Curl - Cable",
          alt1: "Curl - Dumbbell",
          alt2: "Curl - Hammer Dumbbell",
        },
        // Tricep
        {
          category: "tricep",
          role: "isolation",
          primary: "Tricep Pressdown - Cable",
          alt1: "Tricep Press - TRX",
          alt2: "Tricep Dip - Bench Bodyweight",
        },
      ],
      perBlockParams: [
        [
          { sets: 3, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 6, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 5 },
          { sets: 2, reps: 12, rpe: 6, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
        ],
        [
          { sets: 4, reps: 8, rpe: 7, progressionType: "percentage_based", progressionIncrement: 2.5, loadPercent: 70, notesOverride: "Move to DB bench if comfortable" },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "double", progressionIncrement: 5 },
        ],
      ],
    },

    // ===========================================================
    // DAY C — Lower (Knee Dominant) — Block 2+ only
    // ===========================================================
    {
      name: "Day C — Lower (Knee, Block 2+)",
      type: "lifting",
      slots: [
        // Knee-dominant compound (machine if needed)
        {
          category: "squat",
          role: "compound",
          primary: "Leg Press - Machine",
          alt1: "Squat - Goblet Dumbbell",
          alt2: "Squat - Smith Machine",
          notes: "Leg press first — fixed path, controlled depth. Move to barbell back squat in Block 3 if knee is quiet.",
        },
        // Step pattern
        {
          category: "lunge",
          role: "accessory",
          primary: "Step-Up - Bodyweight",
          alt1: "Step-Up - Dumbbell",
          alt2: "Lunge - Reverse Bodyweight",
          notes: "Step-ups before lunges — easier on the knee. 10/leg.",
        },
        // RDL volume (light)
        {
          category: "hinge",
          role: "accessory",
          primary: "Deadlift - Romanian Dumbbell",
          alt1: "Deadlift - Smith Machine Romanian",
          alt2: "Deadlift - Romanian Single Leg Dumbbell",
        },
        // Calves
        {
          category: "calf",
          role: "isolation",
          primary: "Calf Raise - Standing Machine",
          alt1: "Calf Raise - Standing Dumbbell",
          alt2: "Calf Raise - Standing Bodyweight",
        },
        // Core
        {
          category: "core",
          role: "isolation",
          primary: "Pallof Press - Cable",
          alt1: "Pallof Press - Band",
          alt2: "Wood Chop - Cable",
          notes: "10/side anti-rotation",
        },
        // Mobility — face pull-style scapular work
        {
          category: "rear_delt",
          role: "isolation",
          primary: "Face Pull - Cable",
          alt1: "Face Pull - Band",
          alt2: "Cable Raise - Rear Delt Cable",
          notes: "Postural — keeps shoulders healthy through the program.",
        },
      ],
      perBlockParams: [
        // Block 1 — DAY SKIPPED (only 2 days/week in Block 1)
        [
          { sets: 0, reps: 0, progressionType: "none", notesOverride: "Day C skipped in Block 1 — only 2 sessions/week to allow recovery" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
          { sets: 0, reps: 0, progressionType: "none" },
        ],
        // Block 2 — Rebuild (Day C activated)
        [
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 10 },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 0, notesOverride: "10/leg" },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0, notesOverride: "12/side" },
          { sets: 3, reps: 15, rpe: 6, progressionType: "linear", progressionIncrement: 2.5 },
        ],
        // Block 3 — Restore
        [
          { sets: 4, reps: 8, rpe: 7, progressionType: "percentage_based", progressionIncrement: 5, loadPercent: 70, notesOverride: "Move to barbell back squat if knee comfortable" },
          { sets: 3, reps: 10, rpe: 7, progressionType: "linear", progressionIncrement: 5, notesOverride: "10/leg, dumbbells" },
          { sets: 3, reps: 8, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 3, reps: 12, rpe: 7, progressionType: "linear", progressionIncrement: 5 },
          { sets: 2, reps: 12, progressionType: "linear", progressionIncrement: 0 },
          { sets: 3, reps: 15, rpe: 6, progressionType: "linear", progressionIncrement: 2.5 },
        ],
      ],
    },
  ],

  cardioGuidance:
    "Walking only in Block 1 (15-20 min easy, builds joint blood flow). Block 2: 20-30 min walking + optional easy bike. Block 3: 25-35 min, can introduce easy intervals (60s easy / 30s slightly faster x 8) only if all else is going well. NO running, NO sprints, NO HIIT throughout.",
  conditioningGuidance:
    "SKIPPED entirely. Conditioning is a stress on tissues that aren't ready. Wait until you graduate to a different program.",
  mobilityGuidance:
    "PROGRAMMED daily, not just pre-session. 10-15 min mobility sessions on off-days targeting injured area + opposite hip / shoulder for systemic balance. Specific PT exercises if prescribed go FIRST in every session. Don't skip them. Foam rolling 5-10 min daily on the affected area + glutes / lats / pecs.",
  lifestyleGuidance:
    "Sleep 8 hr — tissue repair happens here. NO ALCOHOL during Block 1 (slows healing measurably). Daily 1-10 pain check at the same time each day (morning is best). Pain trending up over 3+ days = back off load by 10% AND skip a session if needed. Ego at the door — your job is to come back stronger, not to chase old PRs in week 4.",

  customizationInputs: [
    {
      key: "return_reason",
      label: "What are you coming back from?",
      type: "select",
      required: true,
      options: [
        { value: "injury_recovered", label: "Injury — fully recovered, cleared by PT" },
        { value: "injury_managing", label: "Injury — still managing some symptoms" },
        { value: "post_surgery", label: "Post-surgery (cleared by surgeon)" },
        { value: "long_break", label: "Long break (6+ months no lifting)" },
        { value: "illness", label: "Illness / hospitalization recovery" },
      ],
    },
    {
      key: "affected_area",
      label: "Affected body area (if applicable)",
      type: "multi_select",
      required: false,
      options: [
        { value: "knee", label: "Knee" },
        { value: "shoulder", label: "Shoulder" },
        { value: "lower_back", label: "Lower back" },
        { value: "hip", label: "Hip" },
        { value: "elbow", label: "Elbow" },
        { value: "wrist", label: "Wrist" },
        { value: "ankle", label: "Ankle" },
        { value: "neck", label: "Neck" },
        { value: "none", label: "None — pure deconditioning" },
      ],
      helpText: "Drives exercise substitutions. We'll auto-swap movements that aggravate flagged areas.",
    },
    {
      key: "current_pain_avg",
      label: "Current daily pain (avg, 1-10)",
      type: "select",
      required: true,
      options: [
        { value: "0", label: "0 — no pain" },
        { value: "1-2", label: "1-2 — minimal, doesn't interrupt life" },
        { value: "3-4", label: "3-4 — noticeable, sometimes annoying" },
        { value: "5+", label: "5+ — interferes with daily activity" },
      ],
      defaultValue: "1-2",
    },
    {
      key: "pt_clearance",
      label: "Cleared by physical therapist / doctor?",
      type: "select",
      required: true,
      options: [
        { value: "yes_lifting", label: "Yes — full clearance for lifting" },
        { value: "yes_modified", label: "Yes — with modifications (per their notes)" },
        { value: "self_managing", label: "Self-managing — no formal clearance" },
        { value: "still_in_pt", label: "Still in PT" },
      ],
    },
    {
      key: "pre_injury_experience",
      label: "Pre-injury / pre-break lifting experience",
      type: "select",
      required: true,
      options: [
        { value: "novice", label: "Novice — never had a real strength base" },
        { value: "intermediate", label: "Intermediate — 1-3 years consistent" },
        { value: "advanced", label: "Advanced — 3+ years, strong before the break" },
      ],
    },
    {
      key: "session_length",
      label: "Realistic session length",
      type: "select",
      required: true,
      options: [
        { value: "45", label: "45 min" },
        { value: "60", label: "60 min" },
      ],
      defaultValue: "60",
    },
  ],

  engineWarnings: [
    {
      trigger: "Current pain ≥ 5/10",
      message: "Pain at 5+ means tissue isn't ready for load yet. See a PT before starting. Don't run Comeback through pain.",
      severity: "error",
    },
    {
      trigger: "User indicates 'still in PT'",
      message: "Comeback is for after PT, not during. Coordinate with your PT — they may have specific exercises that should come first.",
      severity: "warning",
    },
    {
      trigger: "User wants fat loss simultaneously",
      message: "Tissue repair needs energy and protein. Don't run Comeback in a deficit — recovery will stall. Cut after.",
      severity: "warning",
    },
    {
      trigger: "Affected area is 'lower back'",
      message: "We'll swap RDL → Single-Leg RDL, hex bar deadlift → glute bridge variants in Block 1-2. Only barbell loading after Block 2.",
      severity: "info",
    },
    {
      trigger: "Affected area is 'shoulder'",
      message: "We'll swap overhead pressing for landmine / machine variations in Block 1-2. Skip Day B vertical press until Block 3.",
      severity: "info",
    },
    {
      trigger: "Affected area is 'knee'",
      message: "We'll skip lunges and step-ups in Block 1, use leg press only. Squats only in Block 3 if knee is quiet.",
      severity: "info",
    },
  ],

  variantNotes:
    "2-day variant (entire program): if pain is high or schedule is constrained, run only Day A and Day B for the full 12 weeks. 3-day variant kicks in at Block 2. Body-region-specific variants: knee (no plyo / jumping ever), shoulder (machine pressing only Block 1-2), back (no spinal loading Block 1, hip thrust only). After completion: graduate to First 90 Days (if novice pre-injury) or Size & Strength (if intermediate+).",
};
