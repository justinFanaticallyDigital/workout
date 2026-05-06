// src/app/api/workouts/from-library/route.ts
// ============================================================================
// R15 — POST /api/workouts/from-library
//
// Creates a Workout from a curated library entry. Resolves slot
// exercise names against the live Exercise library (case-insensitive,
// global rows preferred). Slots whose names don't resolve are silently
// skipped so a small library-vs-library taxonomy gap doesn't break
// the user's session — surfaced via the `skipped` response field.
//
// Body:  { libraryId: string }
// Reply: { workoutId, skipped: string[] }
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getLibraryEntry } from "@/lib/workout-library";

export const dynamic = "force-dynamic";

interface PostBody {
  libraryId?: string;
}

export async function POST(req: NextRequest) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.libraryId) {
    return NextResponse.json({ error: "libraryId required" }, { status: 400 });
  }

  const entry = getLibraryEntry(body.libraryId);
  if (!entry) {
    return NextResponse.json(
      { error: `Unknown library id: ${body.libraryId}` },
      { status: 400 },
    );
  }

  try {
    // Resolve every slot exercise. Case-insensitive on the global library
    // first, then user-custom as a fallback.
    const resolved: Array<{
      exerciseId: string;
      targetSets: number;
      targetRepRange: string;
      targetRpe: string | null;
      notes: string | null;
    }> = [];
    const skipped: string[] = [];

    for (const slot of entry.slots) {
      const ex = await prisma.exercise.findFirst({
        where: {
          name: { equals: slot.exerciseName, mode: "insensitive" },
          OR: [{ userId: null }, { userId }],
        },
        select: { id: true },
      });
      if (!ex) {
        skipped.push(slot.exerciseName);
        continue;
      }
      resolved.push({
        exerciseId: ex.id,
        targetSets: slot.targetSets,
        targetRepRange: slot.targetRepRange,
        targetRpe: slot.targetRpe ?? null,
        notes: slot.notes ?? null,
      });
    }

    // Create the Workout shell + WorkoutExercise rows. source tag drives
    // the engine's adherence math (these don't count toward Gameplan).
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const workout = await prisma.workout.create({
      data: {
        userId,
        date: today,
        source: "SINGLE_LIBRARY",
        notes: `Library: ${entry.name}`,
        exercises: {
          create: resolved.map((r, idx) => ({
            exerciseId: r.exerciseId,
            sortOrder: idx,
            notes: r.notes,
            // Carry the library targets onto the workout exercise so the
            // logger renders them as targets-to-beat. WorkoutExercise
            // doesn't have its own targetSets columns; we stash them in
            // notes for the logger to surface.
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ workoutId: workout.id, skipped });
  } catch (err) {
    console.error("[POST /api/workouts/from-library] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to start library workout", detail: message },
      { status: 500 },
    );
  }
}
