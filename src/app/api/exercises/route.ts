import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

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

  // Every word of the query must appear somewhere in the name, in any order —
  // "low bar squat" finds "Squat - Low Bar Barbell".
  const words = search?.split(/\s+/).map((w) => w.trim()).filter(Boolean) ?? [];

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(words.length > 0 && { AND: words.map((w) => ({ name: { contains: w, mode: "insensitive" as const } })) }),
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

/**
 * POST /api/exercises — create a custom exercise.
 * Names are unique across the library; a name that already exists (case-insensitive)
 * returns that row with 200 instead of failing, so the picker can use it directly.
 */
export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const existing = await prisma.exercise.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) return NextResponse.json(existing, { status: 200 });

  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const exercise = await prisma.exercise.create({
    data: {
      userId,
      name,
      equipment: str(body.equipment),
      movementPattern: str(body.movementPattern),
      primaryMuscle: str(body.primaryMuscle),
      secondaryMuscle1: str(body.secondaryMuscle1),
      secondaryMuscle2: str(body.secondaryMuscle2),
      isCustom: true,
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
