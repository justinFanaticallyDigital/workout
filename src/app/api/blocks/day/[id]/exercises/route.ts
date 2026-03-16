import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: blockDayId } = await params;
  const body = await request.json();

  // Verify ownership
  const blockDay = await prisma.blockDay.findUnique({
    where: { id: blockDayId, block: { program: { userId } } },
    select: { id: true },
  });
  if (!blockDay) {
    return NextResponse.json({ error: "Block day not found" }, { status: 404 });
  }

  if (!body.exerciseId) {
    return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
  }

  // Get the next sort order
  const last = await prisma.blockDayExercise.findFirst({
    where: { blockDayId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const exercise = await prisma.blockDayExercise.create({
    data: {
      blockDayId,
      exerciseId: body.exerciseId,
      sortOrder,
      targetSets: body.targetSets ?? null,
      targetRepRange: body.targetRepRange ?? null,
      targetRpe: body.targetRpe ?? null,
      progressionType: body.progressionType ?? "none",
      notes: body.notes ?? null,
    },
    include: {
      exercise: { select: { name: true, movementPattern: true } },
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
