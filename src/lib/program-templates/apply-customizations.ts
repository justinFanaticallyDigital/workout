/**
 * Post-clone customization passes.
 *
 * The existing /api/programs/clone route copies a template program's
 * blocks/days/exercises onto a user. After that runs, this module applies
 * the user's customizationAnswers in four independent passes:
 *
 *   1. setStartDate — Program.startDate + cascading block date shift
 *   2. computeNutritionTargets — protein/cal/fat/carb from bodyweight
 *   3. scalePercentageWeights — write actual lb to BlockDayExercise.notes
 *   4. applyInjurySubstitutions — swap exercises in flagged areas
 *
 * Each pass is wrapped in its own try/catch in the caller so a failure
 * in one doesn't break a successful clone. Order matters: start date first
 * (so block dates are correct), then nutrition (independent), then weight
 * scaling, then injury subs (last so we don't waste work scaling weights
 * for an exercise we then swap out).
 *
 * USAGE in the route handler (after the existing clone block):
 *
 *   import { applyCustomizations } from "@/lib/program-templates/apply-customizations";
 *   const warnings: string[] = [];
 *   await applyCustomizations({
 *     prisma, programId: newProgramId, template, answers, warnings,
 *   });
 *   // optionally include warnings in the response
 */

import type { ProgramTemplate } from "./types";
import type { CustomizationAnswers } from "./evaluate-warnings";

// Loose Prisma type so this module compiles without importing the
// full client. The route handler passes its own PrismaClient instance.
type PrismaLike = {
  program: {
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
  block: {
    findMany: (args: {
      where: { programId: string };
      orderBy?: unknown;
    }) => Promise<Array<{ id: string; weekStart?: number; weekEnd?: number }>>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
  blockDayExercise: {
    findMany: (args: {
      where: { blockDay: { block: { programId: string } } };
      include?: unknown;
    }) => Promise<
      Array<{
        id: string;
        exerciseId: string;
        notes: string | null;
        targetSets: number | null;
        blockDay: { block: { id: string; weekStart?: number } };
        exercise: { name: string; primaryMuscle?: string | null };
      }>
    >;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
  exercise: {
    findFirst: (args: {
      where: Record<string, unknown>;
    }) => Promise<{ id: string; name: string } | null>;
  };
  nutritionTarget: {
    upsert?: (args: unknown) => Promise<unknown>;
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    findFirst: (args: {
      where: Record<string, unknown>;
    }) => Promise<{ id: string } | null>;
    update: (args: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => Promise<unknown>;
  };
};

interface ApplyContext {
  prisma: PrismaLike;
  programId: string;
  template: ProgramTemplate;
  answers: CustomizationAnswers;
  /** mutable warnings array — passes can append to surface non-fatal issues */
  warnings: string[];
}

export async function applyCustomizations(ctx: ApplyContext): Promise<void> {
  await safeRun("setStartDate", ctx, setStartDate);
  await safeRun("computeNutritionTargets", ctx, computeNutritionTargets);
  await safeRun("scalePercentageWeights", ctx, scalePercentageWeights);
  await safeRun("applyInjurySubstitutions", ctx, applyInjurySubstitutions);
}

async function safeRun(
  name: string,
  ctx: ApplyContext,
  fn: (ctx: ApplyContext) => Promise<void>,
): Promise<void> {
  try {
    await fn(ctx);
  } catch (err) {
    console.error(`[apply-customizations] ${name} failed:`, err);
    ctx.warnings.push(`${name} pass failed; program may need manual review.`);
  }
}

// =================================================================
// 1. Start date — shift program + blocks
// =================================================================
async function setStartDate(ctx: ApplyContext): Promise<void> {
  const { prisma, programId, answers } = ctx;

  const startStr =
    typeof answers.startDate === "string" && answers.startDate
      ? answers.startDate
      : new Date().toISOString().slice(0, 10); // today

  const start = new Date(startStr);
  if (Number.isNaN(start.getTime())) return;

  await prisma.program.update({
    where: { id: programId },
    data: { startDate: start },
  });

  // Blocks have weekStart/weekEnd; map those to actual dates from start.
  const blocks = await prisma.block.findMany({
    where: { programId },
    orderBy: { weekStart: "asc" },
  });

  for (const b of blocks) {
    const ws = b.weekStart ?? 1;
    const we = b.weekEnd ?? ws;
    const blockStart = addDays(start, (ws - 1) * 7);
    const blockEnd = addDays(start, we * 7 - 1);
    await prisma.block.update({
      where: { id: b.id },
      data: { startDate: blockStart, endDate: blockEnd },
    });
  }
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

// =================================================================
// 2. Nutrition targets — compute from bodyweight + per-block macro spec
// =================================================================
async function computeNutritionTargets(ctx: ApplyContext): Promise<void> {
  const { prisma, programId, template, answers } = ctx;

  const bw = readBodyweight(answers);
  if (bw === null) {
    ctx.warnings.push(
      "No bodyweight provided — skipped nutrition target generation.",
    );
    return;
  }

  // Each template block can declare its own nutritionTarget. We need the
  // DB block ids to attach targets to; pull them ordered to match template.
  const dbBlocks = await prisma.block.findMany({
    where: { programId },
    orderBy: { weekStart: "asc" },
  });

  for (let i = 0; i < template.blocks.length; i++) {
    const tBlock = template.blocks[i];
    const dbBlock = dbBlocks[i];
    if (!tBlock?.nutritionTarget || !dbBlock) continue;

    const t = tBlock.nutritionTarget as TemplateNutritionTarget;
    const protein = round(bw * (t.proteinPerLb ?? 1.0));
    const fat = round(bw * (t.fatPerLb ?? 0.35));
    const carbs = t.carbsPerLb !== undefined ? round(bw * t.carbsPerLb) : null;

    // calories: parse "maintenance+200" / "maintenance-15%" / "maintenance"
    // We don't know maintenance without TDEE → store the directive verbatim
    // in notes if we can't resolve numerically; protein/fat/carbs are the
    // hard targets the user actually tracks.
    const calories = resolveCalories(t.calories, protein, fat, carbs);

    await upsertNutritionTarget(prisma, {
      userId: undefined, // route handler should inject if scoped per user
      programId,
      blockId: dbBlock.id,
      protein,
      fat,
      carbs,
      calories,
      notes: t.notes ?? null,
    });
  }
}

interface TemplateNutritionTarget {
  calories?: string | number;
  proteinPerLb?: number;
  fatPerLb?: number;
  carbsPerLb?: number;
  notes?: string;
}

function readBodyweight(a: CustomizationAnswers): number | null {
  // Templates use different keys — accept any of the common ones.
  const candidates = ["bodyweight", "bodyweight_start", "current_bodyweight"];
  for (const k of candidates) {
    const v = a[k];
    if (typeof v === "number" && v > 0) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

function resolveCalories(
  spec: string | number | undefined,
  protein: number,
  fat: number,
  carbs: number | null,
): number | null {
  if (typeof spec === "number") return spec;
  if (!spec) return null;

  // If we have all three macros, reconstruct calories: 4P + 9F + 4C.
  if (carbs !== null) {
    return Math.round(4 * protein + 9 * fat + 4 * carbs);
  }
  // Otherwise return null — let the user (or a separate TDEE flow) supply it.
  // We deliberately don't guess maintenance from a bw multiplier; that's
  // a coaching judgment, not a calculation.
  return null;
}

function round(n: number): number {
  return Math.round(n);
}

async function upsertNutritionTarget(
  prisma: PrismaLike,
  data: {
    userId?: string;
    programId: string;
    blockId: string;
    protein: number;
    fat: number;
    carbs: number | null;
    calories: number | null;
    notes: string | null;
  },
): Promise<void> {
  // Upsert by (programId, blockId) — adjust fields to your schema.
  const existing = await prisma.nutritionTarget.findFirst({
    where: { programId: data.programId, blockId: data.blockId },
  });
  if (existing) {
    await prisma.nutritionTarget.update({
      where: { id: existing.id },
      data: {
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        calories: data.calories,
        notes: data.notes,
      },
    });
  } else {
    await prisma.nutritionTarget.create({
      data: {
        ...(data.userId ? { userId: data.userId } : {}),
        programId: data.programId,
        blockId: data.blockId,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        calories: data.calories,
        notes: data.notes,
      },
    });
  }
}

// =================================================================
// 3. Percentage scaling — write actual lb into BlockDayExercise.notes
// =================================================================
//
// The template's perBlockParams entries can carry `loadPercent: 75`. When
// the seed runs, that lands on the BlockDayExercise as either a `loadPercent`
// column (if your schema has one) or inside `notes` as a "%1RM" marker.
// Either way, after clone we want the *resolved* lb visible to the user
// when they open the day.
//
// Strategy: walk every BlockDayExercise on the program; if the exercise
// name maps to one of the big lifts (squat/bench/deadlift/ohp), and there's
// a loadPercent we can detect in notes, replace/append a "Target: 235 lb"
// line.
async function scalePercentageWeights(ctx: ApplyContext): Promise<void> {
  const { prisma, programId, answers, template } = ctx;

  // Only powerbuilder + size-and-strength use 1RM percentages; bail early
  // for everything else so we don't churn through every exercise on every
  // template clone.
  const usesPercentages = ["powerbuilder", "size-and-strength"].includes(
    template.slug,
  );
  if (!usesPercentages) return;

  const oneRMs = readOneRMs(answers);
  if (Object.keys(oneRMs).length === 0) {
    ctx.warnings.push(
      "No 1RM data provided — left percentage prescriptions unscaled.",
    );
    return;
  }

  const exercises = await prisma.blockDayExercise.findMany({
    where: { blockDay: { block: { programId } } },
    include: { exercise: true, blockDay: { include: { block: true } } },
  });

  for (const ex of exercises) {
    const lift = matchBigLift(ex.exercise.name);
    if (!lift) continue;

    const oneRM = oneRMs[lift];
    if (!oneRM) continue;

    const pct = parseLoadPercent(ex.notes ?? "");
    if (pct === null) continue;

    const targetLb = roundToFive(oneRM * (pct / 100));
    const updatedNotes = appendTargetLine(ex.notes, targetLb, pct);

    await prisma.blockDayExercise.update({
      where: { id: ex.id },
      data: { notes: updatedNotes },
    });
  }
}

type BigLift = "squat" | "bench" | "deadlift" | "ohp";

function readOneRMs(
  a: CustomizationAnswers,
): Partial<Record<BigLift, number>> {
  const out: Partial<Record<BigLift, number>> = {};
  const grab = (k: string): number | undefined => {
    const v = a[k];
    if (typeof v === "number" && v > 0) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    }
    return undefined;
  };
  const sq = grab("current_squat_1rm");
  const bp = grab("current_bench_1rm");
  const dl = grab("current_deadlift_1rm");
  const op = grab("current_ohp_1rm");
  if (sq) out.squat = sq;
  if (bp) out.bench = bp;
  if (dl) out.deadlift = dl;
  if (op) out.ohp = op;
  // OHP fallback: 65% of bench (matches helpText in the powerbuilder template)
  else if (bp) out.ohp = bp * 0.65;
  return out;
}

function matchBigLift(name: string): BigLift | null {
  const lc = name.toLowerCase();
  if (lc.includes("deadlift") && !lc.includes("romanian")) return "deadlift";
  if (lc.includes("squat") && lc.includes("barbell")) return "squat";
  if (lc.includes("bench press") && lc.includes("barbell")) return "bench";
  if (lc.includes("overhead press") || lc.includes("ohp")) return "ohp";
  return null;
}

function parseLoadPercent(notes: string): number | null {
  // Two formats supported:
  //   "...75% 1RM..."   ← prose form
  //   "loadPercent:75"  ← machine form (if seeder writes it)
  const machine = /loadPercent[:=]\s*(\d{2,3})/i.exec(notes);
  if (machine) return Number(machine[1]);
  const prose = /(\d{2,3})\s*%\s*1RM/i.exec(notes);
  if (prose) return Number(prose[1]);
  return null;
}

function appendTargetLine(
  existing: string | null,
  targetLb: number,
  pct: number,
): string {
  const line = `Target: ${targetLb} lb (${pct}% 1RM)`;
  if (!existing) return line;
  // If we've already stamped a Target line, replace it; otherwise prepend.
  if (/^Target:.*$/m.test(existing)) {
    return existing.replace(/^Target:.*$/m, line);
  }
  return `${line}\n${existing}`;
}

function roundToFive(n: number): number {
  return Math.round(n / 5) * 5;
}

// =================================================================
// 4. Injury substitutions
// =================================================================
//
// Default substitution map by body part. Templates can override by
// declaring `injurySubstitutions` in their metadata (not implemented in
// the provided template files), but this default catches the common cases.
//
// Strategy: for each flagged injury, find exercises whose name/category
// matches the at-risk pattern, and try to swap to the listed alternative
// (matched by name in the user's exercise library).

const INJURY_RULES: Record<
  string,
  { matchPatterns: RegExp[]; preferAlternativeMatching: RegExp[] }
> = {
  knee: {
    matchPatterns: [/squat\s*-\s*(high\s*bar\s*)?barbell/i, /lunge/i],
    preferAlternativeMatching: [/leg press/i, /goblet squat/i, /split squat/i],
  },
  shoulder: {
    matchPatterns: [
      /bench press\s*-\s*(flat\s*)?barbell/i,
      /overhead press/i,
    ],
    preferAlternativeMatching: [
      /bench press.*dumbbell/i,
      /landmine press/i,
      /machine.*press/i,
    ],
  },
  lower_back: {
    matchPatterns: [/deadlift\s*-\s*(conventional\s*)?barbell/i, /good morning/i],
    preferAlternativeMatching: [
      /trap bar/i,
      /rack pull/i,
      /hip thrust/i,
      /romanian.*dumbbell/i,
    ],
  },
  ankle: {
    matchPatterns: [/box jump/i, /sprint/i],
    preferAlternativeMatching: [/bike/i, /rower/i, /elliptical/i],
  },
};

async function applyInjurySubstitutions(ctx: ApplyContext): Promise<void> {
  const { prisma, programId, answers } = ctx;
  const injuries = answers.injuries;
  if (!Array.isArray(injuries) || injuries.length === 0) return;

  const exercises = await prisma.blockDayExercise.findMany({
    where: { blockDay: { block: { programId } } },
    include: { exercise: true, blockDay: { include: { block: true } } },
  });

  for (const injury of injuries) {
    const rule = INJURY_RULES[String(injury)];
    if (!rule) continue;

    for (const ex of exercises) {
      const name = ex.exercise.name;
      const matches = rule.matchPatterns.some((re) => re.test(name));
      if (!matches) continue;

      // Find a replacement in the user's exercise library matching one of
      // the preferred alternatives, in order. First hit wins.
      let replacement: { id: string; name: string } | null = null;
      for (const altRe of rule.preferAlternativeMatching) {
        const found = await prisma.exercise.findFirst({
          where: { name: { contains: altRe.source, mode: "insensitive" } },
        });
        if (found) {
          replacement = found;
          break;
        }
      }

      if (!replacement) {
        ctx.warnings.push(
          `Injury (${injury}): "${name}" flagged but no safer alternative found in library.`,
        );
        continue;
      }

      await prisma.blockDayExercise.update({
        where: { id: ex.id },
        data: { exerciseId: replacement.id },
      });
      ctx.warnings.push(
        `Injury (${injury}): swapped "${name}" → "${replacement.name}".`,
      );
    }
  }
}
