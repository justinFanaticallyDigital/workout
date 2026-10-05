import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { FRAME_INCLUDE, normalizeExercises } from "@/lib/api/frames";

export const dynamic = "force-dynamic";

/** GET /api/frames — the user's frames, most recently updated first. */

export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const frames = await prisma.workoutFrame.findMany({
    where: { userId },
    include: FRAME_INCLUDE,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ frames });
}

/**

 * POST /api/frames

 * { name, focus?, description?, notes?, exercises: [{ exerciseId, targetSets?, targetRepRange?, targetRpe?, notes? }] }

 * A frame captures exercises and targets — never logged weights.

 */

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const exercises = normalizeExercises(body.exercises);
  if (!exercises || exercises.length === 0) {
    return NextResponse.json({ error: "exercises must be a non-empty array of { exerciseId, ... }" }, { status: 400 });
  }

  const frame = await prisma.workoutFrame.create({
    data: {
      userId,
      name,
      focus: body.focus?.trim() || null,
      description: body.description?.trim() || null,
      notes: body.notes?.trim() || null,
      exercises: { create: exercises.map((e, i) => ({ ...e, sortOrder: i + 1 })) },
    },
    include: FRAME_INCLUDE,
  });
  return NextResponse.json(frame, { status: 201 });
}
