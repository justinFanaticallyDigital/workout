import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
  const { id } = await params;

  const program = await prisma.program.findUnique({
    where: { id, userId },
    include: {
      goal: true,
      blocks: {
        include: {
          _count: { select: { workouts: true } },
          days: {
            include: {
              exercises: {
                include: {
                  exercise: { select: { name: true, equipment: true } },
                  altExercise: { select: { name: true, equipment: true } },
                },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { blockNumber: "asc" },
      },
      benchmarks: true,
    },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}
