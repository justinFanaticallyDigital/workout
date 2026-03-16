import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const muscle = searchParams.get("muscle") ?? undefined;
  const equipment = searchParams.get("equipment") ?? undefined;
  const movement = searchParams.get("movement") ?? undefined;

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
      ...(muscle && { primaryMuscle: muscle }),
      ...(equipment && { equipment }),
      ...(movement && { movementPattern: movement }),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ exercises });
}

export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      userId,
      name: body.name,
      equipment: body.equipment ?? null,
      movementPattern: body.movementPattern ?? null,
      primaryMuscle: body.primaryMuscle ?? null,
      secondaryMuscle1: body.secondaryMuscle1 ?? null,
      secondaryMuscle2: body.secondaryMuscle2 ?? null,
      isCustom: true,
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
