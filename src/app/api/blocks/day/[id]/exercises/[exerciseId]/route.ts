import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: blockDayId, exerciseId } = await params;
  const body = await request.json();

  // Verify ownership
  const bde = await prisma.blockDayExercise.findUnique({
    where: { id: exerciseId, blockDayId, blockDay: { block: { program: { userId } } } },
    select: { id: true },
  });
  if (!bde) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  const updated = await prisma.blockDayExercise.update({
    where: { id: exerciseId },
    data: {
      targetSets: body.targetSets !== undefined ? body.targetSets : undefined,
      targetRepRange: body.targetRepRange !== undefined ? body.targetRepRange : undefined,
      targetRpe: body.targetRpe !== undefined ? body.targetRpe : undefined,
      progressionType: body.progressionType !== undefined ? body.progressionType : undefined,
      progressionIncrement: body.progressionIncrement !== undefined ? body.progressionIncrement : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      altExerciseId: body.altExerciseId !== undefined ? body.altExerciseId : undefined,
    },
    include: {
      exercise: { select: { name: true, equipment: true, movementPattern: true } },
      altExercise: { select: { name: true, equipment: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  const userId = await requireAuthUserId();
  const { id: blockDayId, exerciseId } = await params;

  const bde = await prisma.blockDayExercise.findUnique({
    where: { id: exerciseId, blockDayId, blockDay: { block: { program: { userId } } } },
    select: { id: true },
  });
  if (!bde) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  await prisma.blockDayExercise.delete({ where: { id: exerciseId } });

  return NextResponse.json({ deleted: true });
}
