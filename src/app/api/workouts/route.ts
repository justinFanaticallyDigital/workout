import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = await requireAuthUserId();
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const workouts = await prisma.workout.findMany({
    where: { userId },
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
  const userId = await requireAuthUserId();
  const body = await request.json();

  const workout = await prisma.workout.create({
    data: {
      userId,
      date: new Date(body.date ?? new Date()),
      blockId: body.blockId ?? null,
      blockDayId: body.blockDayId ?? null,
      weekNumber: body.weekNumber ?? null,
      startTime: new Date(),
      notes: body.notes ?? null,
      bodyWeight: body.bodyWeight ?? null,
    },
    include: {
      exercises: true,
    },
  });

  return NextResponse.json(workout, { status: 201 });
}
