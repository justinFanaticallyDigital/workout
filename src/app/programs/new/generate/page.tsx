"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { ProgramConfig, PrimaryGoal, Split, Equipment, ExperienceLevel } from "@/lib/program-engine/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOALS: { value: PrimaryGoal; label: string; desc: string }[] = [
  { value: "strength", label: "Get Stronger", desc: "Increase how much you can lift" },
  { value: "hypertrophy", label: "Build Muscle", desc: "Maximize muscle size" },
  { value: "fat_loss", label: "Lose Fat", desc: "Drop body fat while keeping muscle" },
  { value: "recomp", label: "Recomp", desc: "Build muscle and lose fat simultaneously" },
  { value: "general", label: "General Fitness", desc: "Balanced health, strength, and conditioning" },
  { value: "powerlifting", label: "Powerlifting", desc: "Squat/bench/deadlift focus" },
  { value: "physique", label: "Physique Competition", desc: "Bodybuilding, bikini, figure, etc." },
  { value: "athletic", label: "Sport / Athletic", desc: "Sport performance training" },
];

const SPLITS: { value: Split; label: string }[] = [
  { value: "auto", label: "Recommend for me" },
  { value: "full_body", label: "Full Body" },
  { value: "upper_lower", label: "Upper / Lower" },
  { value: "push_pull_legs", label: "Push / Pull / Legs" },
  { value: "push_pull", label: "Push / Pull" },
  { value: "bro_split", label: "Body Part Split" },
  { value: "powerlifting", label: "Squat / Bench / Deadlift" },
];

const EQUIPMENT: { value: Equipment; label: string; desc: string }[] = [
  { value: "full_gym", label: "Full Gym", desc: "Barbells, dumbbells, cables, machines" },
  { value: "barbell_home", label: "Home Gym (Barbell)", desc: "Rack, barbell, bench, dumbbells" },
  { value: "dumbbell_only", label: "Dumbbells Only", desc: "Adjustable or fixed dumbbells" },
  { value: "home_minimal", label: "Minimal Home", desc: "Light dumbbells, bands, bodyweight" },
  { value: "bodyweight", label: "Bodyweight Only", desc: "No equipment" },
];

const EXPERIENCE: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "Less than 1 year" },
  { value: "intermediate", label: "Intermediate", desc: "1-3 years consistent" },
  { value: "advanced", label: "Advanced", desc: "3+ years experience" },
  { value: "elite", label: "Elite", desc: "5+ years competitive" },
];

const DAYS_OPTIONS = [2, 3, 4, 5, 6] as const;
const TIME_OPTIONS = [30, 45, 60, 75, 90] as const;
const DURATION_OPTIONS = [4, 8, 12, 16] as const;

const PHYSIQUE_DIVISIONS = [
  { value: "bodybuilding", label: "Bodybuilding" },
  { value: "classic_physique", label: "Classic Physique" },
  { value: "mens_physique", label: "Men's Physique" },
  { value: "bikini", label: "Bikini" },
  { value: "figure", label: "Figure" },
  { value: "wellness", label: "Wellness" },
] as const;

const SLEEP_OPTIONS = [
  { value: "poor", label: "Poor", desc: "Under 6 hours" },
  { value: "fair", label: "Fair", desc: "6-7 hours" },
  { value: "good", label: "Good", desc: "7-8 hours" },
  { value: "great", label: "Great", desc: "8+ hours" },
] as const;

const STRESS_OPTIONS = [
  { value: "low", label: "Low stress" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High stress" },
  { value: "physical", label: "Physically demanding job" },
] as const;

const NUTRITION_OPTIONS = [
  { value: "surplus", label: "Caloric surplus (gaining)" },
  { value: "maintenance", label: "Maintenance" },
  { value: "mild_deficit", label: "Mild deficit" },
  { value: "aggressive_deficit", label: "Aggressive deficit" },
  { value: "not_tracking", label: "Not tracking" },
] as const;

const INJURY_PARTS = [
  "shoulder_l", "shoulder_r", "elbow_l", "elbow_r",
  "wrist_l", "wrist_r", "upper_back", "lower_back",
  "hip_l", "hip_r", "knee_l", "knee_r", "ankle_l", "ankle_r",
] as const;

const INJURY_LABELS: Record<string, string> = {
  shoulder_l: "Left Shoulder", shoulder_r: "Right Shoulder",
  elbow_l: "Left Elbow", elbow_r: "Right Elbow",
  wrist_l: "Left Wrist", wrist_r: "Right Wrist",
  upper_back: "Upper Back", lower_back: "Lower Back",
  hip_l: "Left Hip", hip_r: "Right Hip",
  knee_l: "Left Knee", knee_r: "Right Knee",
  ankle_l: "Left Ankle", ankle_r: "Right Ankle",
};

const MOVEMENT_LIMITATIONS = [
  { value: "overhead", label: "Can't press overhead" },
  { value: "deep_squat", label: "Can't squat to depth" },
  { value: "hip_hinge", label: "Trouble with deadlift position" },
  { value: "grip", label: "Grip gives out early" },
  { value: "balance", label: "Unilateral work is shaky" },
] as const;

const TRAINING_STYLES = [
  { value: "heavy_compounds", label: "Lifting heavy" },
  { value: "pump", label: "Chasing the pump" },
  { value: "variety", label: "Exercise variety" },
  { value: "efficiency", label: "Get in and out" },
  { value: "structure", label: "Clear plan" },
  { value: "flexibility", label: "Room to improvise" },
  { value: "progress_tracking", label: "Numbers going up" },
] as const;

const MODALITIES = [
  { value: "stretch", label: "Stretch / Mobility" },
  { value: "hiit", label: "HIIT / Conditioning" },
  { value: "liss", label: "Steady-state Cardio" },
] as const;

const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "quads", "hamstrings",
  "glutes", "biceps", "triceps", "calves", "core",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Path = "quick" | "guided";

// Guided path steps
const GUIDED_STEPS = [
  "Goal",
  "Schedule",
  "Background",
  "Equipment",
  "Recovery",
  "Injuries",
  "Preferences",
  "Benchmarks",
  "Review",
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GenerateProgramPage() {
  const router = useRouter();
  const toast = useToast();

  // Path selection
  const [path, setPath] = useState<Path | null>(null);

  // Guided step
  const [step, setStep] = useState(0);

  // Form state
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | "">("");
  const [secondaryGoal, setSecondaryGoal] = useState<PrimaryGoal | "">("");
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);
  const [minutesPerSession, setMinutesPerSession] = useState<number>(60);
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");
  const [splitPreference, setSplitPreference] = useState<Split>("auto");
  const [equipment, setEquipment] = useState<Equipment>("full_gym");
  const [exercisePreference, setExercisePreference] = useState<"barbell" | "dumbbell" | "machine" | "mixed">("mixed");
  const [durationWeeks, setDurationWeeks] = useState<number>(12);

  // Recovery
  const [sleepQuality, setSleepQuality] = useState<string>("good");
  const [stressLevel, setStressLevel] = useState<string>("moderate");
  const [nutritionContext, setNutritionContext] = useState<string>("not_tracking");

  // Injuries
  const [injuries, setInjuries] = useState<string[]>([]);
  const [movementLimitations, setMovementLimitations] = useState<string[]>([]);

  // Preferences
  const [trainingStyles, setTrainingStyles] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);

  // Competition
  const [physiqueDivision, setPhysiqueDivision] = useState<string>("");
  const [competitionDate, setCompetitionDate] = useState<string>("");

  // Benchmarks
  const [bodyWeight, setBodyWeight] = useState<string>("");
  const [squatMax, setSquatMax] = useState<string>("");
  const [benchMax, setBenchMax] = useState<string>("");
  const [deadliftMax, setDeadliftMax] = useState<string>("");

  // Weak points (physique)
  const [weakPoints, setWeakPoints] = useState<string[]>([]);

  // Powerlifting
  const [weakestLift, setWeakestLift] = useState<string>("");

  // Submission
  const [saving, setSaving] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function toggleArray(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  function buildConfig(): ProgramConfig {
    const config: ProgramConfig = {
      primaryGoal: primaryGoal as PrimaryGoal,
      daysPerWeek: daysPerWeek as ProgramConfig["daysPerWeek"],
      minutesPerSession: minutesPerSession as ProgramConfig["minutesPerSession"],
      experience: experience,
      splitPreference: splitPreference,
      equipment: equipment,
      exercisePreference: exercisePreference,
      durationWeeks: durationWeeks as ProgramConfig["durationWeeks"],
      modalities: ["lifting", ...modalities] as ProgramConfig["modalities"],
      includeNutrition: false,
    };

    if (secondaryGoal) config.secondaryGoal = secondaryGoal as PrimaryGoal;
    if (sleepQuality !== "good") config.sleepQuality = sleepQuality as ProgramConfig["sleepQuality"];
    if (stressLevel !== "moderate") config.stressLevel = stressLevel as ProgramConfig["stressLevel"];
    if (nutritionContext !== "not_tracking") config.nutritionContext = nutritionContext as ProgramConfig["nutritionContext"];
    if (injuries.length) config.injuries = injuries as ProgramConfig["injuries"];
    if (movementLimitations.length) config.movementLimitations = movementLimitations as ProgramConfig["movementLimitations"];
    if (trainingStyles.length) config.trainingStyles = trainingStyles as ProgramConfig["trainingStyles"];

    if (primaryGoal === "physique" && physiqueDivision) {
      config.physiqueDivision = physiqueDivision as ProgramConfig["physiqueDivision"];
    }
    if (competitionDate) config.competitionDate = competitionDate;
    if (weakPoints.length) config.weakPoints = weakPoints as ProgramConfig["weakPoints"];
    if (weakestLift) config.weakestLift = weakestLift as ProgramConfig["weakestLift"];

    if (bodyWeight) {
      config.bodyWeight = parseFloat(bodyWeight);
      config.bodyWeightUnit = "lbs";
    }

    const maxes: ProgramConfig["currentMaxes"] = {};
    if (squatMax) maxes.squat = { weight: parseFloat(squatMax), reps: 1, unit: "lbs" };
    if (benchMax) maxes.bench = { weight: parseFloat(benchMax), reps: 1, unit: "lbs" };
    if (deadliftMax) maxes.deadlift = { weight: parseFloat(deadliftMax), reps: 1, unit: "lbs" };
    if (Object.keys(maxes).length) config.currentMaxes = maxes;

    return config;
  }

  async function handleGenerate() {
    if (!primaryGoal) return;
    setSaving(true);
    setWarnings([]);

    try {
      const config = buildConfig();
      const res = await fetch("/api/programs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, quick: path === "quick" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate program");
      }

      const data = await res.json();

      if (data.warnings?.length) {
        setWarnings(data.warnings);
      }

      toast.success("Program generated!");
      router.push(`/programs/${data.programId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Guided step validation
  // ---------------------------------------------------------------------------

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!primaryGoal;
      case 1: return true;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      case 6: return true;
      case 7: return true;
      case 8: return true;
      default: return true;
    }
  }

  // ---------------------------------------------------------------------------
  // Shared UI Components
  // ---------------------------------------------------------------------------

  function SelectCard({ selected, onClick, label, desc }: {
    selected: boolean; onClick: () => void; label: string; desc?: string;
  }) {
    return (
      <button
        onClick={onClick}
        className={`p-3 rounded-lg border text-left transition-all w-full ${
          selected
            ? "border-ft-accent bg-ft-accent/10 text-ft-white"
            : "border-ft-border bg-ft-surface text-ft-light hover:border-ft-accent/50"
        }`}
      >
        <div className="font-body font-semibold text-sm">{label}</div>
        {desc && <div className="text-xs text-ft-dim mt-0.5">{desc}</div>}
      </button>
    );
  }

  function PillToggle({ selected, onClick, label }: {
    selected: boolean; onClick: () => void; label: string;
  }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
          selected
            ? "bg-ft-accent text-white"
            : "bg-ft-surface text-ft-light border border-ft-border hover:border-ft-accent/50"
        }`}
      >
        {label}
      </button>
    );
  }

  function ButtonGroup({ options, value, onChange }: {
    options: { value: number; label: string }[];
    value: number;
    onChange: (v: number) => void;
  }) {
    return (
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${
              value === opt.value
                ? "bg-ft-accent text-white"
                : "bg-ft-surface text-ft-light border border-ft-border hover:border-ft-accent/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Path Selection
  // ---------------------------------------------------------------------------

  if (!path) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/programs/new" className="text-ft-dim hover:text-ft-light text-lg">←</Link>
          <h1 className="text-xl font-display text-ft-white">Smart Program Generator</h1>
        </div>

        <p className="text-ft-light text-sm font-body">
          Answer a few questions and we&apos;ll build a complete training program tailored to you.
        </p>

        <div className="space-y-3">
          <Card>
            <button onClick={() => setPath("quick")} className="w-full text-left p-4">
              <div className="font-display text-ft-white text-lg">Quick Start</div>
              <p className="text-ft-dim text-sm font-body mt-1">
                5 questions, ~30 seconds. We&apos;ll handle the rest with smart defaults.
              </p>
            </button>
          </Card>

          <Card>
            <button onClick={() => setPath("guided")} className="w-full text-left p-4">
              <div className="font-display text-ft-white text-lg">Full Questionnaire</div>
              <p className="text-ft-dim text-sm font-body mt-1">
                9 steps, 3-5 minutes. Fine-tune every detail like a coach intake.
              </p>
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Quick Path (5 questions on one screen)
  // ---------------------------------------------------------------------------

  if (path === "quick") {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setPath(null)} className="text-ft-dim hover:text-ft-light text-lg">←</button>
          <h1 className="text-xl font-display text-ft-white">Quick Start</h1>
        </div>

        {/* Q1: Primary Goal */}
        <div>
          <label className="text-ft-light text-sm font-body block mb-2">What are you training for?</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <SelectCard
                key={g.value}
                selected={primaryGoal === g.value}
                onClick={() => setPrimaryGoal(g.value)}
                label={g.label}
                desc={g.desc}
              />
            ))}
          </div>
        </div>

        {/* Q2: Days/Week */}
        <div>
          <label className="text-ft-light text-sm font-body block mb-2">Days per week?</label>
          <ButtonGroup
            options={DAYS_OPTIONS.map((d) => ({ value: d, label: `${d}` }))}
            value={daysPerWeek}
            onChange={setDaysPerWeek}
          />
        </div>

        {/* Q3: Time/Session */}
        <div>
          <label className="text-ft-light text-sm font-body block mb-2">Time per session?</label>
          <ButtonGroup
            options={TIME_OPTIONS.map((t) => ({ value: t, label: `${t} min` }))}
            value={minutesPerSession}
            onChange={setMinutesPerSession}
          />
        </div>

        {/* Q4: Experience */}
        <div>
          <label className="text-ft-light text-sm font-body block mb-2">Training experience?</label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERIENCE.map((e) => (
              <SelectCard
                key={e.value}
                selected={experience === e.value}
                onClick={() => setExperience(e.value)}
                label={e.label}
                desc={e.desc}
              />
            ))}
          </div>
        </div>

        {/* Q5: Split */}
        <div>
          <label className="text-ft-light text-sm font-body block mb-2">Training split?</label>
          <div className="grid grid-cols-2 gap-2">
            {SPLITS.map((s) => (
              <SelectCard
                key={s.value}
                selected={splitPreference === s.value}
                onClick={() => setSplitPreference(s.value)}
                label={s.label}
              />
            ))}
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-ft-warn/10 border border-ft-warn/30 rounded-lg p-3">
            <div className="text-ft-warn text-xs font-body font-semibold mb-1">Heads up:</div>
            {warnings.map((w, i) => (
              <div key={i} className="text-ft-dim text-xs font-body">• {w}</div>
            ))}
          </div>
        )}

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={!primaryGoal || saving}
          className="w-full py-3 rounded-lg font-display text-white bg-ft-accent disabled:opacity-40 transition-all"
        >
          {saving ? "Generating..." : "Generate Program"}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Guided Path (9 steps)
  // ---------------------------------------------------------------------------

  const stepLabel = GUIDED_STEPS[step];
  const isLastStep = step === GUIDED_STEPS.length - 1;
  const showPhysique = primaryGoal === "physique";
  const showPowerlifting = primaryGoal === "powerlifting";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? setPath(null) : setStep(step - 1))}
          className="text-ft-dim hover:text-ft-light text-lg"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display text-ft-white">
            Step {step + 1}: {stepLabel}
          </h1>
          {/* Progress bar */}
          <div className="w-full h-1 bg-ft-surface rounded mt-1">
            <div
              className="h-1 bg-ft-accent rounded transition-all"
              style={{ width: `${((step + 1) / GUIDED_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-ft-dim text-xs font-body">
          {step + 1}/{GUIDED_STEPS.length}
        </span>
      </div>

      {/* Step 1: Goal */}
      {step === 0 && (
        <div className="space-y-4">
          <label className="text-ft-light text-sm font-body block">What are you training for?</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <SelectCard
                key={g.value}
                selected={primaryGoal === g.value}
                onClick={() => setPrimaryGoal(g.value)}
                label={g.label}
                desc={g.desc}
              />
            ))}
          </div>

          {primaryGoal && (
            <>
              <label className="text-ft-light text-sm font-body block">Secondary goal? (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                <SelectCard
                  selected={!secondaryGoal}
                  onClick={() => setSecondaryGoal("")}
                  label="None"
                />
                {GOALS.filter((g) => g.value !== primaryGoal).map((g) => (
                  <SelectCard
                    key={g.value}
                    selected={secondaryGoal === g.value}
                    onClick={() => setSecondaryGoal(g.value)}
                    label={g.label}
                  />
                ))}
              </div>
            </>
          )}

          {showPhysique && (
            <>
              <label className="text-ft-light text-sm font-body block">Division?</label>
              <div className="grid grid-cols-2 gap-2">
                {PHYSIQUE_DIVISIONS.map((d) => (
                  <SelectCard
                    key={d.value}
                    selected={physiqueDivision === d.value}
                    onClick={() => setPhysiqueDivision(d.value)}
                    label={d.label}
                  />
                ))}
              </div>
            </>
          )}

          {(showPhysique || showPowerlifting) && (
            <div>
              <label className="text-ft-light text-sm font-body block mb-1">Competition date? (optional)</label>
              <input
                type="date"
                value={competitionDate}
                onChange={(e) => setCompetitionDate(e.target.value)}
                className="w-full bg-ft-surface text-ft-white border border-ft-border rounded-lg px-3 py-2 text-sm font-body"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Schedule */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Days per week?</label>
            <ButtonGroup
              options={DAYS_OPTIONS.map((d) => ({ value: d, label: `${d}` }))}
              value={daysPerWeek}
              onChange={setDaysPerWeek}
            />
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Time per session?</label>
            <ButtonGroup
              options={TIME_OPTIONS.map((t) => ({ value: t, label: `${t} min` }))}
              value={minutesPerSession}
              onChange={setMinutesPerSession}
            />
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Program duration?</label>
            <ButtonGroup
              options={DURATION_OPTIONS.map((d) => ({ value: d, label: `${d} weeks` }))}
              value={durationWeeks}
              onChange={setDurationWeeks}
            />
          </div>
        </div>
      )}

      {/* Step 3: Background */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Training experience?</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE.map((e) => (
                <SelectCard
                  key={e.value}
                  selected={experience === e.value}
                  onClick={() => setExperience(e.value)}
                  label={e.label}
                  desc={e.desc}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Preferred split?</label>
            <div className="grid grid-cols-2 gap-2">
              {SPLITS.map((s) => (
                <SelectCard
                  key={s.value}
                  selected={splitPreference === s.value}
                  onClick={() => setSplitPreference(s.value)}
                  label={s.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Equipment */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Where do you train?</label>
            <div className="space-y-2">
              {EQUIPMENT.map((e) => (
                <SelectCard
                  key={e.value}
                  selected={equipment === e.value}
                  onClick={() => setEquipment(e.value)}
                  label={e.label}
                  desc={e.desc}
                />
              ))}
            </div>
          </div>
          {equipment !== "bodyweight" && (
            <div>
              <label className="text-ft-light text-sm font-body block mb-2">Equipment preference?</label>
              <div className="flex gap-2 flex-wrap">
                {(["mixed", "barbell", "dumbbell", "machine"] as const).map((p) => (
                  <PillToggle
                    key={p}
                    selected={exercisePreference === p}
                    onClick={() => setExercisePreference(p)}
                    label={p.charAt(0).toUpperCase() + p.slice(1)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Recovery */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">How&apos;s your sleep?</label>
            <div className="grid grid-cols-2 gap-2">
              {SLEEP_OPTIONS.map((s) => (
                <SelectCard
                  key={s.value}
                  selected={sleepQuality === s.value}
                  onClick={() => setSleepQuality(s.value)}
                  label={s.label}
                  desc={s.desc}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Life stress?</label>
            <div className="grid grid-cols-2 gap-2">
              {STRESS_OPTIONS.map((s) => (
                <SelectCard
                  key={s.value}
                  selected={stressLevel === s.value}
                  onClick={() => setStressLevel(s.value)}
                  label={s.label}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Nutrition?</label>
            <div className="space-y-2">
              {NUTRITION_OPTIONS.map((n) => (
                <SelectCard
                  key={n.value}
                  selected={nutritionContext === n.value}
                  onClick={() => setNutritionContext(n.value)}
                  label={n.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Injuries */}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Any injuries? (tap to select)</label>
            <div className="flex gap-2 flex-wrap">
              {INJURY_PARTS.map((p) => (
                <PillToggle
                  key={p}
                  selected={injuries.includes(p)}
                  onClick={() => setInjuries(toggleArray(injuries, p))}
                  label={INJURY_LABELS[p]}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Movement limitations?</label>
            <div className="flex gap-2 flex-wrap">
              {MOVEMENT_LIMITATIONS.map((m) => (
                <PillToggle
                  key={m.value}
                  selected={movementLimitations.includes(m.value)}
                  onClick={() => setMovementLimitations(toggleArray(movementLimitations, m.value))}
                  label={m.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 7: Preferences */}
      {step === 6 && (
        <div className="space-y-4">
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">What keeps you motivated? (pick up to 3)</label>
            <div className="flex gap-2 flex-wrap">
              {TRAINING_STYLES.map((s) => (
                <PillToggle
                  key={s.value}
                  selected={trainingStyles.includes(s.value)}
                  onClick={() => {
                    if (trainingStyles.includes(s.value)) {
                      setTrainingStyles(trainingStyles.filter((v) => v !== s.value));
                    } else if (trainingStyles.length < 3) {
                      setTrainingStyles([...trainingStyles, s.value]);
                    }
                  }}
                  label={s.label}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-2">Add non-lifting modalities?</label>
            <div className="flex gap-2 flex-wrap">
              {MODALITIES.map((m) => (
                <PillToggle
                  key={m.value}
                  selected={modalities.includes(m.value)}
                  onClick={() => setModalities(toggleArray(modalities, m.value))}
                  label={m.label}
                />
              ))}
            </div>
          </div>

          {showPhysique && (
            <div>
              <label className="text-ft-light text-sm font-body block mb-2">Weak points to bring up? (up to 3)</label>
              <div className="flex gap-2 flex-wrap">
                {MUSCLE_GROUPS.map((m) => (
                  <PillToggle
                    key={m}
                    selected={weakPoints.includes(m)}
                    onClick={() => {
                      if (weakPoints.includes(m)) {
                        setWeakPoints(weakPoints.filter((v) => v !== m));
                      } else if (weakPoints.length < 3) {
                        setWeakPoints([...weakPoints, m]);
                      }
                    }}
                    label={m.charAt(0).toUpperCase() + m.slice(1)}
                  />
                ))}
              </div>
            </div>
          )}

          {showPowerlifting && (
            <div>
              <label className="text-ft-light text-sm font-body block mb-2">Weakest lift?</label>
              <div className="flex gap-2">
                {["squat", "bench", "deadlift"].map((l) => (
                  <PillToggle
                    key={l}
                    selected={weakestLift === l}
                    onClick={() => setWeakestLift(weakestLift === l ? "" : l)}
                    label={l.charAt(0).toUpperCase() + l.slice(1)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 8: Benchmarks */}
      {step === 7 && (
        <div className="space-y-4">
          <p className="text-ft-dim text-xs font-body">All optional — helps the engine program starting weights.</p>
          <div>
            <label className="text-ft-light text-sm font-body block mb-1">Body weight (lbs)</label>
            <input
              type="number"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              placeholder="185"
              className="w-full bg-ft-surface text-ft-white border border-ft-border rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-1">Squat 1RM (lbs)</label>
            <input
              type="number"
              value={squatMax}
              onChange={(e) => setSquatMax(e.target.value)}
              placeholder="315"
              className="w-full bg-ft-surface text-ft-white border border-ft-border rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-1">Bench 1RM (lbs)</label>
            <input
              type="number"
              value={benchMax}
              onChange={(e) => setBenchMax(e.target.value)}
              placeholder="225"
              className="w-full bg-ft-surface text-ft-white border border-ft-border rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
          <div>
            <label className="text-ft-light text-sm font-body block mb-1">Deadlift 1RM (lbs)</label>
            <input
              type="number"
              value={deadliftMax}
              onChange={(e) => setDeadliftMax(e.target.value)}
              placeholder="405"
              className="w-full bg-ft-surface text-ft-white border border-ft-border rounded-lg px-3 py-2 text-sm font-body"
            />
          </div>
        </div>
      )}

      {/* Step 9: Review */}
      {step === 8 && (
        <div className="space-y-3">
          <Card>
            <div className="p-3 space-y-2 text-sm font-body">
              <Row label="Goal" value={GOALS.find((g) => g.value === primaryGoal)?.label || ""} />
              {secondaryGoal && (
                <Row label="Secondary" value={GOALS.find((g) => g.value === secondaryGoal)?.label || ""} />
              )}
              <Row label="Days/Week" value={`${daysPerWeek}`} />
              <Row label="Session" value={`${minutesPerSession} min`} />
              <Row label="Duration" value={`${durationWeeks} weeks`} />
              <Row label="Experience" value={experience} />
              <Row label="Split" value={SPLITS.find((s) => s.value === splitPreference)?.label || ""} />
              <Row label="Equipment" value={EQUIPMENT.find((e) => e.value === equipment)?.label || ""} />
              {injuries.length > 0 && (
                <Row label="Injuries" value={injuries.map((i) => INJURY_LABELS[i]).join(", ")} />
              )}
              {physiqueDivision && <Row label="Division" value={physiqueDivision} />}
              {weakestLift && <Row label="Weakest Lift" value={weakestLift} />}
            </div>
          </Card>

          {warnings.length > 0 && (
            <div className="bg-ft-warn/10 border border-ft-warn/30 rounded-lg p-3">
              <div className="text-ft-warn text-xs font-body font-semibold mb-1">Engine notes:</div>
              {warnings.map((w, i) => (
                <div key={i} className="text-ft-dim text-xs font-body">• {w}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-lg font-body text-ft-light border border-ft-border hover:border-ft-accent/50 transition-all"
          >
            Back
          </button>
        )}
        {isLastStep ? (
          <button
            onClick={handleGenerate}
            disabled={!primaryGoal || saving}
            className="flex-1 py-3 rounded-lg font-display text-white bg-ft-accent disabled:opacity-40 transition-all"
          >
            {saving ? "Generating..." : "Generate Program"}
          </button>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex-1 py-3 rounded-lg font-display text-white bg-ft-accent disabled:opacity-40 transition-all"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review Row
// ---------------------------------------------------------------------------

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ft-dim">{label}</span>
      <span className="text-ft-white capitalize">{value}</span>
    </div>
  );
}
