import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { FRAME_INCLUDE, normalizeExercises } from "@/lib/api/frames";

export const dynamic = "force-dynamic";

async function ownFrame(userId: string, id: string) {
  return prisma.workoutFrame.findFirst({ where: { id, userId }, select: { id: true } });
}

/** GET /api/frames/[id] */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const frame = await prisma.workoutFrame.findFirst({ where: { id, userId }, include: FRAME_INCLUDE });
  if (!frame) return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  return NextResponse.json(frame);
}

/** PATCH /api/frames/[id] — name / focus / description / notes; `exercises` replaces the list. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await ownFrame(userId, id))) return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const exercises = body.exercises !== undefined ? normalizeExercises(body.exercises) : undefined;
  if (body.exercises !== undefined && (!exercises || exercises.length === 0)) {
    return NextResponse.json({ error: "exercises must be a non-empty array" }, { status: 400 });
  }

  const data = {
    ...(body.name !== undefined && { name: String(body.name).trim() }),
    ...(body.focus !== undefined && { focus: body.focus ? String(body.focus).trim() : null }),
    ...(body.description !== undefined && { description: body.description ? String(body.description).trim() : null }),
    ...(body.notes !== undefined && { notes: body.notes ? String(body.notes).trim() : null }),
    ...(exercises && {
      exercises: { deleteMany: {}, create: exercises.map((e, i) => ({ ...e, sortOrder: i + 1 })) },
    }),
  };
  const frame = await prisma.workoutFrame.update({ where: { id }, data, include: FRAME_INCLUDE });
  return NextResponse.json(frame);
}

/** DELETE /api/frames/[id] — workouts started from it keep their rows (frameId → null). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await ownFrame(userId, id))) return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  await prisma.workoutFrame.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
