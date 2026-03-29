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

  // Load exercise library
  const dbExercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId }] },
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

  // Run engine but don't save
  const blueprint = quick
    ? generateQuick(config, exercises)
    : generate(config, exercises);

  // Return the preview (no DB writes)
  return NextResponse.json({
    name: blueprint.name,
    description: blueprint.description,
    durationWeeks: blueprint.durationWeeks,
    warnings: blueprint.warnings || [],
    splitSuggestions: blueprint.splitSuggestions || [],
    blocks: blueprint.blocks.map((block) => ({
      name: block.name,
      phase: block.phase,
      durationWeeks: block.durationWeeks,
      days: block.days.map((day) => ({
        name: day.name,
        dayType: day.dayType,
        slots: day.slots.map((slot) => ({
          category: slot.category,
          role: slot.role,
          primaryName: slot.primary.exerciseName,
          targetSets: slot.primary.targetSets,
          targetRepRange: slot.primary.targetRepRange,
          targetRpe: slot.primary.targetRpe,
          progressionType: slot.primary.progressionType,
          alternatives: slot.alternatives.map((a) => a.exerciseName),
        })),
      })),
    })),
    nutritionTargets: blueprint.nutritionTargets,
  });
}
