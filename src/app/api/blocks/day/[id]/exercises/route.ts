import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: blockDayId } = await params;
  const body = await request.json();

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
