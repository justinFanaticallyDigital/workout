import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const blockDayId = searchParams.get("blockDayId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  const workouts = await prisma.workout.findMany({
    where: {
      userId,
      ...(blockDayId ? { blockDayId } : {}),
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true } },
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      },
      blockDay: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json({ workouts });
}

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(body.date ?? new Date()),
      blockId: body.blockId ?? null,
      blockDayId: body.blockDayId ?? null,
      weekNumber: body.weekNumber ?? null,
      startTime: body.startTime ? new Date(body.startTime) : new Date(),
      notes: body.notes ?? null,
      bodyWeight: body.bodyWeight ?? null,
    },
    include: {
      exercises: true,
    },
  });

  return NextResponse.json(workout, { status: 201 });
}
