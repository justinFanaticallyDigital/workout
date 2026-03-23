import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  try {
    const routines = await prisma.stretchRoutine.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { exercise: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(routines);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  try {
    const body = await req.json();

    const routine = await prisma.stretchRoutine.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
        items: {
          create: (body.items ?? []).map((item: { name: string; durationSeconds: number; bilateral?: boolean; exerciseId?: string; notes?: string }, i: number) => ({
            name: item.name,
            durationSeconds: item.durationSeconds,
            bilateral: item.bilateral ?? false,
            sortOrder: i,
            exerciseId: item.exerciseId,
            notes: item.notes,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(routine, { status: 201 });
  } catch {
    return NextResponse.json({ error: "stretch_routines table may not exist yet" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const routine = await prisma.stretchRoutine.findUnique({ where: { id, userId } });
  if (!routine) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  await prisma.stretchRoutineItem.deleteMany({ where: { routineId: id } });
  await prisma.stretchRoutine.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
