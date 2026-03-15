import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const block = await prisma.block.findUnique({
    where: { id },
    include: {
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
