import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_OPTIONS } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  // Fetch adjacent exercises alphabetically for prev/next navigation
  const [prev, next] = await Promise.all([
    prisma.exercise.findFirst({
      where: { name: { lt: exercise.name } },
      orderBy: { name: "desc" },
      select: { id: true, name: true },
    }),
    prisma.exercise.findFirst({
      where: { name: { gt: exercise.name } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return NextResponse.json({ ...exercise, adjacent: { prev, next } });
}

const KNOWN_PATTERNS = new Set(CATEGORY_OPTIONS.flatMap((g) => g.patterns));

/**
 * PATCH /api/exercises/[id]  { name?, movementPattern?, primaryMuscle?, equipment? }
 * The category picker edits movementPattern (one of lib/categories' patterns).
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  if (body.movementPattern !== undefined && body.movementPattern !== null && !KNOWN_PATTERNS.has(String(body.movementPattern))) {
    return NextResponse.json({ error: `Unknown movementPattern: ${String(body.movementPattern)}` }, { status: 400 });
  }
  if (body.name !== undefined && !String(body.name).trim()) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  const exists = await prisma.exercise.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.movementPattern !== undefined && { movementPattern: body.movementPattern ? String(body.movementPattern) : null }),
      ...(body.primaryMuscle !== undefined && { primaryMuscle: body.primaryMuscle ? String(body.primaryMuscle) : null }),
      ...(body.equipment !== undefined && { equipment: body.equipment ? String(body.equipment) : null }),
    },
  });
  return NextResponse.json(exercise);
}
