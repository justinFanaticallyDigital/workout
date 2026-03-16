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

  // Support comma-separated multi-select values
  const muscles = muscle?.split(",").filter(Boolean);
  const equipments = equipment?.split(",").filter(Boolean);
  const movements = movement?.split(",").filter(Boolean);

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
      ...(muscles?.length === 1 && { primaryMuscle: muscles[0] }),
      ...(muscles && muscles.length > 1 && { primaryMuscle: { in: muscles } }),
      ...(equipments?.length === 1 && { equipment: equipments[0] }),
      ...(equipments && equipments.length > 1 && { equipment: { in: equipments } }),
      ...(movements?.length === 1 && { movementPattern: movements[0] }),
      ...(movements && movements.length > 1 && { movementPattern: { in: movements } }),
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
