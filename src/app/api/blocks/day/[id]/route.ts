import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const day = await prisma.blockDay.findUnique({
    where: { id },
    include: {
      block: { select: { name: true } },
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
          exercise: { select: { name: true, movementPattern: true, primaryMuscle: true } },
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
