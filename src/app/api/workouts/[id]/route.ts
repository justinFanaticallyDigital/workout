import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id },
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
  const { id } = await params;
  const body = await request.json();

  const workout = await prisma.workout.update({
    where: { id },
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
  const { id } = await params;

  await prisma.set.deleteMany({
    where: { workoutExercise: { workoutId: id } },
  });
  await prisma.workoutExercise.deleteMany({ where: { workoutId: id } });
  await prisma.workout.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
