// Derivation: engine ProgramTemplate -> PickerPlan (display shape).
// Keeps the picker UI decoupled from engine internals — if engine
// metadata changes we only update this one file.

import type { ProgramTemplate } from "@/lib/program-engine";

export interface PickerPlan {
  id: string;
  name: string;
  description: string;
  durationWeeks: number;
  daysPerWeek: number;
  /** 1=beginner, 3=intermediate, 5=advanced */
  difficulty: number;
  /** 7-day training pattern (Mon..Sun, 1=train, 0=rest) */
  pattern: number[];
  /** Block bands for the WeeksBar visual (split into ~4-wk segments). */
  blocks: { wks: number; color: string }[];
  /** Frequency breakdown per week. */
  freq: {
    lift: number;
    cardio: number | [number, number];
    cond: number | [number, number];
    nutrition: boolean;
    mobility: boolean;
  };
  /** Display tags (color-keyed for MovementTag). */
  tags: { kind: "push" | "pull" | "legs" | "core" | "accent"; label: string }[];
  /** Whether the template has all of `wants`'s tags — used for "best fit" badge. */
  bestFit?: boolean;
  raw: ProgramTemplate;
}

const ACCENT = "rgb(var(--ft-accent))";
const PUSH = "rgb(var(--ft-push))";
const PULL = "rgb(var(--ft-pull))";
const LEGS = "rgb(var(--ft-legs))";
const CORE = "rgb(var(--ft-core))";

function difficultyFromTags(tags: string[]): number {
  if (tags.includes("beginner")) return 1;
  if (tags.includes("any-level")) return 2;
  if (tags.includes("intermediate")) return 3;
  if (tags.includes("advanced")) return 5;
  return 3;
}

/**
 * Build a 7-day training pattern. Spreads N training days across
 * Mon..Sun with 1+ rest day between when possible.
 */
function patternFor(daysPerWeek: number): number[] {
  const masks: Record<number, number[]> = {
    2: [1, 0, 0, 1, 0, 0, 0],
    3: [1, 0, 1, 0, 1, 0, 0],
    4: [1, 1, 0, 1, 1, 0, 0],
    5: [1, 1, 0, 1, 1, 1, 0],
    6: [1, 1, 1, 1, 1, 1, 0],
  };
  return masks[daysPerWeek] ?? masks[3];
}

/**
 * Split program duration into 4-week blocks color-banded by phase intent.
 * The engine produces real phase blocks at generation time — this is just
 * the picker preview; tone/order is illustrative, not structural.
 */
function blocksFor(durationWeeks: number, primaryGoal: string): { wks: number; color: string }[] {
  const colorOrder: string[] =
    primaryGoal === "fat_loss"
      ? [LEGS, CORE, LEGS, CORE]
      : primaryGoal === "athletic"
      ? [PULL, PUSH, LEGS, ACCENT]
      : primaryGoal === "powerlifting"
      ? [PULL, PUSH, PULL, LEGS]
      : primaryGoal === "physique" || primaryGoal === "hypertrophy"
      ? [PULL, ACCENT, PULL, LEGS]
      : [PULL, PUSH, PULL, LEGS];

  // Split duration into ~4-week segments (deload included in the last segment of each).
  const segs: { wks: number; color: string }[] = [];
  let remaining = durationWeeks;
  let i = 0;
  while (remaining > 0) {
    const wks = Math.min(4, remaining);
    segs.push({ wks, color: colorOrder[i % colorOrder.length] });
    remaining -= wks;
    i++;
  }
  return segs;
}

/**
 * Frequency breakdown — lift days = config.daysPerWeek, plus modality flags.
 * Engine modalities: 'lifting' | 'stretch' | 'hiit' | 'liss'.
 * For display purposes we map liss→cardio, hiit→conditioning, stretch→mobility.
 */
function freqFor(t: ProgramTemplate): PickerPlan["freq"] {
  const dpw = t.config.daysPerWeek ?? 3;
  const modalities = t.config.modalities ?? ["lifting"];
  const isCut =
    (t.config.primaryGoal as string) === "fat_loss" ||
    t.tags.includes("cut") ||
    t.tags.includes("fat-loss");
  const isAthletic = t.tags.includes("athletic") || t.tags.includes("performance");
  const hasLiss = modalities.includes("liss");
  const hasHiit = modalities.includes("hiit");
  const hasStretch = modalities.includes("stretch");
  return {
    lift: dpw,
    cardio: isCut ? 3 : isAthletic ? [1, 2] : hasLiss ? 2 : ([0, 1] as [number, number]),
    cond: isAthletic ? 2 : hasHiit ? 1 : 0,
    nutrition: !!t.config.includeNutrition || isCut,
    mobility: hasStretch || t.tags.includes("recovery") || t.tags.includes("longevity"),
  };
}

/**
 * Display tags (max 2) — color-coded by primary tags.
 */
function tagsFor(t: ProgramTemplate): PickerPlan["tags"] {
  const out: PickerPlan["tags"] = [];
  const has = (s: string) => t.tags.includes(s);
  if (has("strength")) out.push({ kind: "push", label: "STRENGTH" });
  if (has("hypertrophy")) out.push({ kind: "pull", label: "HYPERTROPHY" });
  if (has("fat-loss") || has("cut")) out.push({ kind: "legs", label: "FAT LOSS" });
  if (has("athletic") || has("performance")) out.push({ kind: "pull", label: "PERFORMANCE" });
  if (has("powerlifting")) out.push({ kind: "legs", label: "PEAK" });
  if (has("physique") || has("bikini")) out.push({ kind: "core", label: "PHYSIQUE" });
  if (has("beginner") && out.length < 2) out.push({ kind: "accent", label: "BEGINNER" });
  if (has("home") && out.length < 2) out.push({ kind: "core", label: "HOME" });
  if (out.length === 0) out.push({ kind: "accent", label: t.tags[0]?.toUpperCase() ?? "GENERAL" });
  return out.slice(0, 2);
}

export function templateToPlan(t: ProgramTemplate, filters?: Partial<Record<string, string>>): PickerPlan {
  const dpw = t.config.daysPerWeek ?? 3;
  const dur = t.config.durationWeeks ?? 12;
  const goal = (t.config.primaryGoal as string) ?? "general";
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    durationWeeks: dur,
    daysPerWeek: dpw,
    difficulty: difficultyFromTags(t.tags),
    pattern: patternFor(dpw),
    blocks: blocksFor(dur, goal),
    freq: freqFor(t),
    tags: tagsFor(t),
    bestFit: filters ? computeBestFit(t, filters) : false,
    raw: t,
  };
}

/**
 * Best-fit heuristic — true when the template matches every non-empty
 * filter slot the user set (Goal / Experience / Days / Equipment).
 * Mirrors the prototype's `best: true` flag on PLANS — we compute it
 * on the fly instead of hand-flagging templates.
 */
function computeBestFit(
  t: ProgramTemplate,
  filters: Partial<Record<string, string>>,
): boolean {
  const activeKeys = Object.entries(filters).filter(([, v]) => v != null && v !== "");
  if (activeKeys.length === 0) return false;
  const goal = filters.goal;
  const experience = filters.experience;
  const days = filters.daysPerWeek;
  const equipment = filters.equipment;
  if (goal && !t.tags.includes(goal)) return false;
  if (experience && !t.tags.includes(experience) && !t.tags.includes("any-level")) return false;
  if (days && !t.tags.includes(`${days}-day`)) return false;
  if (equipment) {
    const eq = t.config.equipment;
    if (eq) {
      if (equipment === "home" && !(eq === "home_minimal" || t.tags.includes("home"))) return false;
      if (equipment === "limited_gym" && eq === "full_gym") return false;
    }
  }
  return true;
}
