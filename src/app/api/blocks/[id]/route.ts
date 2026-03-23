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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await (request as Request & { json(): Promise<Record<string, unknown>> }).json();

  const block = await prisma.block.findUnique({
    where: { id, program: { userId } },
    select: { id: true },
  });
  if (!block) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }

  const updated = await prisma.block.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.status !== undefined && { status: body.status as "active" | "completed" | "upcoming" }),
      ...(body.durationWeeks !== undefined && { durationWeeks: body.durationWeeks as number | null }),
      ...(body.phase !== undefined && { phase: body.phase as string | null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const block = await prisma.block.findUnique({
    where: { id, program: { userId } },
    select: { id: true },
  });
  if (!block) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }

  const days = await prisma.blockDay.findMany({ where: { blockId: id }, select: { id: true } });
  const dayIds = days.map((d) => d.id);
  if (dayIds.length > 0) {
    await prisma.blockDayExercise.deleteMany({ where: { blockDayId: { in: dayIds } } });
    await prisma.blockDay.deleteMany({ where: { id: { in: dayIds } } });
  }
  await prisma.block.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
