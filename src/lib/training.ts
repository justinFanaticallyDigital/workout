/**
 * Plan shapes and formatting shared by the Training screens.
 *
 * A plan is a Program; its days are BlockDays. Hand-built plans have one Block
 * ("Days"); pre-made plans may have several, in which case the UI shows one
 * block at a time and numbers days within it.
 */
import type { ProgramTemplate } from "@/lib/program-templates/types";

export const DAY_EXERCISE_SELECT = {
  id: true,
  exerciseId: true,
  sortOrder: true,
  targetSets: true,
  targetRepRange: true,
  targetRpe: true,
  notes: true,
  exercise: { select: { id: true, name: true, movementPattern: true, primaryMuscle: true, equipment: true } },
} as const;

export interface PlanExercise {
  id: string;
  exerciseId: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  sortOrder: number;
}

export interface PlanDay {
  id: string;
  name: string;
  sortOrder: number;
  exercises: PlanExercise[];
}

export interface PlanBlock {
  id: string;
  name: string;
  blockNumber: number;
  status: string;
  phase: string | null;
  days: PlanDay[];
}

export type PlanStatusValue = "active" | "paused" | "completed";

export interface Plan {
  id: string;
  name: string;
  status: PlanStatusValue;
  description: string | null;
  startDate: string | null;
  createdAt: string;
  gameplanKind: string | null;
  blocks: PlanBlock[];
}

/** Structural input so this stays free of Prisma types (browser-safe). */
interface RawExercise {
  id: string;
  exerciseId: string;
  sortOrder: number;
  targetSets: number | null;
  targetRepRange: string | null;
  targetRpe: string | null;
  exercise: { id: string; name: string; movementPattern: string | null; primaryMuscle: string | null; equipment: string | null };
}
interface RawDay { id: string; name: string; sortOrder: number; exercises: RawExercise[] }
interface RawBlock { id: string; name: string; blockNumber: number; status: string; phase: string | null; days: RawDay[] }
interface RawProgram {
  id: string;
  name: string;
  status: string;
  description: string | null;
  startDate: Date | null;
  createdAt: Date;
  gameplanKind: string | null;
  blocks: RawBlock[];
}

export function mapPlan(p: RawProgram): Plan {
  return {
    id: p.id,
    name: p.name,
    status: (p.status as PlanStatusValue) ?? "active",
    description: stripMeta(p.description),
    startDate: p.startDate ? p.startDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    gameplanKind: p.gameplanKind,
    blocks: p.blocks.map((b) => ({
      id: b.id,
      name: b.name,
      blockNumber: b.blockNumber,
      status: b.status,
      phase: b.phase,
      days: b.days.map((d) => ({
        id: d.id,
        name: d.name,
        sortOrder: d.sortOrder,
        exercises: d.exercises.map((e) => ({
          id: e.id,
          exerciseId: e.exerciseId,
          name: e.exercise.name,
          movementPattern: e.exercise.movementPattern,
          primaryMuscle: e.exercise.primaryMuscle,
          equipment: e.exercise.equipment,
          targetSets: e.targetSets,
          targetRepRange: e.targetRepRange,
          targetRpe: e.targetRpe,
          sortOrder: e.sortOrder,
        })),
      })),
    })),
  };
}

/** Seeded template descriptions carry a JSON tail after ---META---. */
export function stripMeta(description: string | null | undefined): string | null {
  if (!description) return null;
  const idx = description.indexOf("\n---META---\n");
  return (idx >= 0 ? description.slice(0, idx) : description).trim() || null;
}

/** The block the Training tab shows: first not-completed block, else the last. */
export function currentBlock(plan: Plan): PlanBlock | null {
  if (plan.blocks.length === 0) return null;
  return plan.blocks.find((b) => b.status !== "completed") ?? plan.blocks[plan.blocks.length - 1];
}

/** "6-8" → "6–8"; "AMRAP" stays. */
export function fmtReps(reps: string | null | undefined): string {
  if (!reps) return "—";
  return reps.replace(/\s*-\s*/g, "–");
}

/** "4 × 6–8" (cards) or "4×6–8" (tags). */
export function fmtTarget(sets: number | null | undefined, reps: string | null | undefined, compact = false): string {
  const s = sets ?? "—";
  const r = fmtReps(reps);
  return compact ? `${s}×${r}` : `${s} × ${r}`;
}

/** "Pull-Ups · 4 × 6–8" */
export function exerciseLine(e: PlanExercise): string {
  return `${e.name} · ${fmtTarget(e.targetSets, e.targetRepRange)}`;
}

/** Rough session length from total working sets. */
export function estimateMinutes(day: PlanDay): number {
  const sets = day.exercises.reduce((n, e) => n + (e.targetSets ?? 3), 0);
  return Math.max(15, Math.round((sets * 2.5 + 5) / 5) * 5);
}

const EQUIPMENT_LABEL: Record<ProgramTemplate["equipment"], string> = {
  full_gym: "FULL GYM",
  home_dumbbells: "DUMBBELLS",
  minimal: "MINIMAL",
};

/** "4 DAYS · INTERMEDIATE · FULL GYM" */
export function premadeMeta(t: ProgramTemplate, days: number): string {
  const level = t.experienceLevel === "any" ? "ALL LEVELS" : t.experienceLevel.toUpperCase();
  return `${days} DAYS · ${level} · ${EQUIPMENT_LABEL[t.equipment]}`;
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
