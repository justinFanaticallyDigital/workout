import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workoutId } = await params;
  const body = await request.json();

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
