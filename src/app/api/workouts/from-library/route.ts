// src/app/api/workouts/from-library/route.ts
// ============================================================================
// POST /api/workouts/from-library
//
// Resolves library-entry slots to live Exercise rows. Returns the
// resolved exercise data so the client can pre-populate the workout
// logger as an improv (new-blank) session — the actual Workout row is
// only created when the user taps Finish, matching the existing
// improv-lift flow. This avoids the BlockDay-vs-Workout id confusion in
// the /log/[workoutId] router.
//
// Resolution is case-insensitive against the global library first,
// then user-custom. Slots that don't resolve are silently skipped and
// surfaced via the `skipped` array so the client can toast about them.
//
// Multi-option slots accept an optional `selections` array — one chosen
// option index per slot (length should match entry.slots.length). Out-of-
// range / missing indices fall back to option 0.
//
// Body:  { libraryId: string, selections?: number[] }
// Reply: { entry: { id, name }, exercises: ResolvedSlot[], skipped: string[] }
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { getLibraryEntry, resolveSlotChoice } from "@/lib/workout-library";

export const dynamic = "force-dynamic";

interface PostBody {
  libraryId?: string;
  selections?: number[];
}

interface ResolvedSlot {
  exerciseId: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  targetSets: number;
  targetRepRange: string;
  targetRpe: string | null;
  notes: string | null;
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

  const selections = Array.isArray(body.selections) ? body.selections : [];
  const exercises: ResolvedSlot[] = [];
  const skipped: string[] = [];

  try {
    for (let i = 0; i < entry.slots.length; i++) {
      const slot = entry.slots[i];
      const chosenName = resolveSlotChoice(slot, selections[i]);
      if (!chosenName) continue;
      const ex = await prisma.exercise.findFirst({
        where: {
          name: { equals: chosenName, mode: "insensitive" },
          OR: [{ userId: null }, { userId }],
        },
        select: { id: true, name: true, movementPattern: true, primaryMuscle: true },
      });
      if (!ex) {
        skipped.push(chosenName);
        continue;
      }
      exercises.push({
        exerciseId: ex.id,
        name: ex.name,
        movementPattern: ex.movementPattern,
        primaryMuscle: ex.primaryMuscle,
        targetSets: slot.targetSets,
        targetRepRange: slot.targetRepRange,
        targetRpe: slot.targetRpe ?? null,
        notes: slot.notes ?? null,
      });
    }

    return NextResponse.json({
      entry: { id: entry.id, name: entry.name },
      exercises,
      skipped,
    });
  } catch (err) {
    console.error("[POST /api/workouts/from-library] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to resolve library workout", detail: message },
      { status: 500 },
    );
  }
}
