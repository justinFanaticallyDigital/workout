import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * GET /api/workouts/[id]/exercises
 * List all exercises for a workout with their sets.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: workoutId } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId, userId },
    select: { id: true },
  });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  const exercises = await prisma.workoutExercise.findMany({
    where: { workoutId },
    include: {
      exercise: { select: { name: true, equipment: true, movementPattern: true } },
      sets: { orderBy: { setNumber: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(exercises);
}

/**
 * POST /api/workouts/[id]/exercises
 * Add an exercise to a workout.
 */
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

/**
 * PATCH /api/workouts/[id]/exercises
 * Update a workout exercise (notes, sortOrder). Requires exerciseId in body.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: workoutId } = await params;
  const body = await request.json();

  if (!body.workoutExerciseId) {
    return NextResponse.json({ error: "workoutExerciseId is required" }, { status: 400 });
  }

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId, userId },
    select: { id: true },
  });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  const we = await prisma.workoutExercise.findFirst({
    where: { id: body.workoutExerciseId, workoutId },
    select: { id: true },
  });
  if (!we) {
    return NextResponse.json({ error: "Workout exercise not found" }, { status: 404 });
  }

  const updated = await prisma.workoutExercise.update({
    where: { id: body.workoutExerciseId },
    data: {
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
    include: {
      exercise: { select: { name: true, equipment: true } },
      sets: { orderBy: { setNumber: "asc" } },
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/workouts/[id]/exercises
 * Remove an exercise from a workout. Requires workoutExerciseId query param.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id: workoutId } = await params;
  const { searchParams } = new URL(request.url);
  const workoutExerciseId = searchParams.get("workoutExerciseId");

  if (!workoutExerciseId) {
    return NextResponse.json({ error: "workoutExerciseId is required" }, { status: 400 });
  }

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId, userId },
    select: { id: true },
  });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  const we = await prisma.workoutExercise.findFirst({
    where: { id: workoutExerciseId, workoutId },
    select: { id: true },
  });
  if (!we) {
    return NextResponse.json({ error: "Workout exercise not found" }, { status: 404 });
  }

  await prisma.workoutExercise.delete({ where: { id: workoutExerciseId } });

  return NextResponse.json({ deleted: true });
}
