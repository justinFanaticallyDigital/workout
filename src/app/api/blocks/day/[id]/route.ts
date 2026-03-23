import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { DayType } from "@/generated/prisma/enums";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await (request as Request & { json(): Promise<Record<string, unknown>> }).json();

  const day = await prisma.blockDay.findUnique({
    where: { id, block: { program: { userId } } },
    select: { id: true },
  });
  if (!day) {
    return NextResponse.json({ error: "Block day not found" }, { status: 404 });
  }

  const updated = await prisma.blockDay.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.dayType !== undefined && { dayType: body.dayType as DayType }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder as number }),
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

  const day = await prisma.blockDay.findUnique({
    where: { id, block: { program: { userId } } },
    select: { id: true },
  });
  if (!day) {
    return NextResponse.json({ error: "Block day not found" }, { status: 404 });
  }

  await prisma.blockDay.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
