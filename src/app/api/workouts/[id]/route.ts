import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id, userId },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, equipment: true, movementPattern: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      },
      blockDay: { select: { name: true } },
    },
  });

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  return NextResponse.json(workout);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id } = await params;
  const body = await request.json();

  const workout = await prisma.workout.update({
    where: { id, userId },
    data: {
      ...(body.endTime && { endTime: new Date(body.endTime) }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.rating !== undefined && { rating: body.rating }),
      ...(body.bodyWeight !== undefined && { bodyWeight: body.bodyWeight }),
    },
  });

  return NextResponse.json(workout);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id } = await params;

  // Verify ownership
  const workout = await prisma.workout.findUnique({ where: { id, userId } });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  await prisma.set.deleteMany({
    where: { workoutExercise: { workoutId: id } },
  });
  await prisma.workoutExercise.deleteMany({ where: { workoutId: id } });
  await prisma.workout.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
