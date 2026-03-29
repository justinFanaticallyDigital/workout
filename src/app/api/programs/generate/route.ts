import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { generate, generateQuick } from "@/lib/program-engine";
import type { ProgramConfig, ExerciseRecord } from "@/lib/program-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: { config: ProgramConfig; quick?: boolean };
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
      description: blueprint.description,
      durationWeeks: blueprint.durationWeeks,
      startDate: new Date(),
      status: "active",
    },
  });

  // Create Blocks -> BlockDays -> BlockDayExercises
  for (const block of blueprint.blocks) {
    const createdBlock = await prisma.block.create({
      data: {
        programId: program.id,
        name: block.name,
        blockNumber: block.blockNumber,
        durationWeeks: block.durationWeeks,
        phase: block.phase,
        status: block.blockNumber === 1 ? "active" : "upcoming",
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
            notes: primary.notes
              ? `[${slot.category}] ${primary.notes}`
              : `[${slot.category}]`,
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

  return NextResponse.json(
    {
      programId: program.id,
      name: blueprint.name,
      warnings: blueprint.warnings || [],
      splitSuggestions: blueprint.splitSuggestions || [],
    },
    { status: 201 },
  );
}
