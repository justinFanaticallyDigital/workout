import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const day = await prisma.blockDay.findUnique({
    where: { id, block: { program: { userId } } },
    include: {
      block: { select: { name: true, description: true } },
      exercises: {
        select: {
          id: true,
          exerciseId: true,
          sortOrder: true,
          targetSets: true,
          targetRepRange: true,
          targetRpe: true,
          progressionType: true,
          progressionIncrement: true,
          notes: true,
          exercise: { select: { name: true, movementPattern: true, primaryMuscle: true } },
          altExercise: { select: { name: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!day) {
    return NextResponse.json({ error: "Block day not found" }, { status: 404 });
  }

  return NextResponse.json(day);
}
