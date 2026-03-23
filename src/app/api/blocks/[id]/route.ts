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

  const block = await prisma.block.findUnique({
    where: { id, program: { userId } },
    include: {
      program: { select: { name: true } },
      _count: { select: { workouts: true } },
      days: {
        include: {
          exercises: {
            include: {
              exercise: { select: { name: true, equipment: true, movementPattern: true } },
              altExercise: { select: { name: true, equipment: true } },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!block) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }

  return NextResponse.json(block);
}
