import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

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
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (!userId) return errorRes!;

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
}
