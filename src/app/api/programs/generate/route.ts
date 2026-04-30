import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { generate, generateQuick } from "@/lib/program-engine";
import type { ProgramConfig, ExerciseRecord } from "@/lib/program-engine";
import {
  gameplanTemplate,
  inferGameplanKindFromTemplate,
  isValidGameplanKind,
  type GameplanTemplate,
} from "@/lib/program-templates";

export const dynamic = "force-dynamic";

interface AltExercise {
  exerciseId: string;
  exerciseName: string;
}

function buildNotes(
  category: string,
  role: string,
  exerciseNotes: string | undefined,
  alternatives: AltExercise[],
): string {
  // Store structured metadata in notes for the UI to parse
  // Format: [category|role|altsJSON] optional notes text
  const alts = alternatives.map((a) => ({ id: a.exerciseId, name: a.exerciseName }));
  const meta = `[${category}|${role}|${JSON.stringify(alts)}]`;
  return exerciseNotes ? `${meta} ${exerciseNotes}` : meta;
}

export async function POST(request: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: {
    config: ProgramConfig;
    quick?: boolean;
    /** R12 — caller-supplied gameplan kind (overrides inference). */
    gameplanKind?: string | null;
    /** R12 — caller-supplied program-engine template id, used when
     *  the caller didn't pass an explicit gameplanKind. */
    programEngineTemplateId?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { config, quick } = body;

  if (!config?.primaryGoal || !config?.daysPerWeek) {
    return NextResponse.json(
      { error: "primaryGoal and daysPerWeek are required" },
      { status: 400 },
    );
  }

  // R12 — resolve gameplanKind from explicit field first, falling
  // back to inference from the program-engine template id. Unknown
  // explicit kinds → 400 so the picker fails fast rather than
  // persisting a garbage tag.
  let resolvedGameplanKind: string | null = null;
  if (typeof body.gameplanKind === "string") {
    if (!isValidGameplanKind(body.gameplanKind)) {
      return NextResponse.json(
        { error: `Unknown gameplanKind: ${body.gameplanKind}` },
        { status: 400 },
      );
    }
    resolvedGameplanKind = body.gameplanKind;
  } else if (body.programEngineTemplateId) {
    resolvedGameplanKind = inferGameplanKindFromTemplate(body.programEngineTemplateId);
  }
  const gameplanTpl = gameplanTemplate(resolvedGameplanKind);

  // Load exercise library from DB
  const dbExercises = await prisma.exercise.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
    },
    select: {
      id: true,
      name: true,
      movementPattern: true,
      primaryMuscle: true,
      secondaryMuscle1: true,
      secondaryMuscle2: true,
      equipment: true,
      isCustom: true,
    },
  });

  // Map to engine's ExerciseRecord format
  const exercises: ExerciseRecord[] = dbExercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    movementPattern: ex.movementPattern || "",
    primaryMuscle: ex.primaryMuscle || "",
    secondaryMuscles: [ex.secondaryMuscle1, ex.secondaryMuscle2]
      .filter(Boolean)
      .join(", ") || null,
    equipment: ex.equipment || null,
    category: null,
    isCustom: ex.isCustom,
  }));

  // Run the engine
  const blueprint = quick
    ? generateQuick(config, exercises)
    : generate(config, exercises);

  // Create Program
  const program = await prisma.program.create({
    data: {
      userId,
      name: blueprint.name,
      description: blueprint.warnings?.length
        ? `${blueprint.description}\n---WARNINGS---\n${JSON.stringify(blueprint.warnings)}`
        : blueprint.description,
      durationWeeks: blueprint.durationWeeks,
      startDate: new Date(),
      status: "active",
      // R12 — tag with gameplan kind so refeed_due (and future kind-
      // gated rules / UI) have something to read.
      gameplanKind: resolvedGameplanKind,
    },
  });

  // Create Blocks -> BlockDays -> BlockDayExercises
  for (const block of blueprint.blocks) {
    // R12 — Lean Out + similar gameplans seed a default refeed cadence.
    // refeedWeeks within a block are 1-indexed week numbers (e.g.
    // [4, 8] = end of week 4 + end of week 8). Trim to the block's
    // duration so we don't write weeks past the block's end.
    const refeedWeeks = computeRefeedWeeks(gameplanTpl, block.durationWeeks);

    const createdBlock = await prisma.block.create({
      data: {
        programId: program.id,
        name: block.name,
        blockNumber: block.blockNumber,
        durationWeeks: block.durationWeeks,
        phase: block.phase,
        status: block.blockNumber === 1 ? "active" : "upcoming",
        ...(refeedWeeks.length > 0 ? { refeedWeeks } : {}),
      },
    });

    for (const day of block.days) {
      const createdDay = await prisma.blockDay.create({
        data: {
          blockId: createdBlock.id,
          name: day.name,
          dayNumber: day.dayNumber,
          dayType: day.dayType,
          sortOrder: day.dayNumber,
        },
      });

      // Each CategorySlot becomes a BlockDayExercise
      for (const slot of day.slots) {
        const primary = slot.primary;
        const firstAlt = slot.alternatives[0];

        // Verify exercise exists in DB (engine may have stale IDs)
        const exerciseExists = exercises.some((e) => e.id === primary.exerciseId);
        if (!exerciseExists) continue;

        const altExists = firstAlt
          ? exercises.some((e) => e.id === firstAlt.exerciseId)
          : false;

        await prisma.blockDayExercise.create({
          data: {
            blockDayId: createdDay.id,
            exerciseId: primary.exerciseId,
            altExerciseId: altExists ? firstAlt.exerciseId : null,
            sortOrder: slot.sortOrder,
            targetSets: primary.targetSets,
            targetRepRange: primary.targetRepRange,
            targetRpe: primary.targetRpe,
            progressionType: primary.progressionType,
            progressionIncrement: primary.progressionIncrement,
            notes: buildNotes(slot.category, slot.role, primary.notes, slot.alternatives),
          },
        });
      }
    }
  }

  // Create metric targets as ProgramBenchmarks
  if (blueprint.metricTargets?.length) {
    for (const target of blueprint.metricTargets) {
      await prisma.programBenchmark.create({
        data: {
          programId: program.id,
          label: target.metricKey,
          targetValue: target.targetValue,
          targetUnit: target.unit,
        },
      });
    }
  }

  // R12 — seed 3 default LifestyleTarget rows from the gameplan
  // template's spec §7 picks. Best-effort: failure here doesn't roll
  // back the program (the user can still set lifestyle targets
  // manually). Skips keys the user already has a target for to avoid
  // clobbering existing preferences.
  if (gameplanTpl) {
    try {
      await seedLifestyleTargets(userId, program.id, gameplanTpl);
    } catch {
      // Don't surface the failure — log silently in future, but for
      // now the engine still runs without seeded targets.
    }
  }

  return NextResponse.json(
    {
      programId: program.id,
      name: blueprint.name,
      gameplanKind: resolvedGameplanKind,
      warnings: blueprint.warnings || [],
      splitSuggestions: blueprint.splitSuggestions || [],
    },
    { status: 201 },
  );
}

/* ─── R12 helpers ───────────────────────────────────────────── */

function computeRefeedWeeks(
  tpl: GameplanTemplate | null,
  blockDurationWeeks: number | null,
): number[] {
  if (!tpl?.defaultRefeedCadence || !blockDurationWeeks) return [];
  return tpl.defaultRefeedCadence.filter((w) => w >= 1 && w <= blockDurationWeeks);
}

async function seedLifestyleTargets(
  userId: string,
  programId: string,
  tpl: GameplanTemplate,
): Promise<void> {
  // Find any existing program-scoped or user-wide rows to skip
  // duplicates — preserves prior R6/R9 picks if the user customized.
  const existing = await prisma.lifestyleTarget.findMany({
    where: { userId, key: { in: tpl.defaultLifestylePicks.map((p) => p.key) } },
    select: { key: true, programId: true },
  });
  const existingKeys = new Set(existing.map((e) => e.key));

  for (const pick of tpl.defaultLifestylePicks) {
    if (existingKeys.has(pick.key)) continue;
    await prisma.lifestyleTarget.create({
      data: {
        userId,
        programId,
        key: pick.key,
        value: pick.value,
        unit: pick.unit,
        comparator: pick.comparator,
      },
    });
  }
}
