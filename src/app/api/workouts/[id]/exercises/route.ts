import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: workoutId } = await params;
  const body = await request.json();

  // Verify ownership
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId, userId },
    select: { id: true },
  });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  if (!body.exerciseId) {
    return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
  }

  const last = await prisma.workoutExercise.findFirst({
    where: { workoutId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const workoutExercise = await prisma.workoutExercise.create({
    data: {
      workoutId,
      exerciseId: body.exerciseId,
      sortOrder,
      notes: body.notes ?? null,
    },
    include: {
      exercise: { select: { name: true, equipment: true } },
      sets: true,
    },
  });

  return NextResponse.json(workoutExercise, { status: 201 });
}
