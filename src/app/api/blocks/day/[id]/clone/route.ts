import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  // Find the source day with exercises
  const source = await prisma.blockDay.findUnique({
    where: { id, block: { program: { userId } } },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  // Get next sort order in the block
  const last = await prisma.blockDay.findFirst({
    where: { blockId: source.blockId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  // Create the cloned day
  const cloned = await prisma.blockDay.create({
    data: {
      blockId: source.blockId,
      dayNumber: sortOrder,
      name: `${source.name} (copy)`,
      dayType: source.dayType,
      sortOrder,
    },
  });

  // Clone all exercises
  for (const ex of source.exercises) {
    await prisma.blockDayExercise.create({
      data: {
        blockDayId: cloned.id,
        exerciseId: ex.exerciseId,
        altExerciseId: ex.altExerciseId,
        sortOrder: ex.sortOrder,
        targetSets: ex.targetSets,
        targetRepRange: ex.targetRepRange,
        targetRpe: ex.targetRpe,
        progressionType: ex.progressionType,
        progressionIncrement: ex.progressionIncrement,
        notes: ex.notes,
      },
    });
  }

  // Return the full cloned day with exercises
  const result = await prisma.blockDay.findUnique({
    where: { id: cloned.id },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, equipment: true, movementPattern: true } },
          altExercise: { select: { name: true, equipment: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(result, { status: 201 });
}
