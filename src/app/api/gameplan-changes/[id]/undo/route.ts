// src/app/api/gameplan-changes/[id]/undo/route.ts
// ============================================================================
// R10 — POST /api/gameplan-changes/[id]/undo
//
// Reverts a single GameplanChange row by re-running the dispatcher
// with oldValue swapped in. Writes a *new* GameplanChange row
// recording the undo, so the audit log is append-only — undoing an
// undo just keeps walking the chain rather than mutating history.
//
// If the original change was sourced from a Recommendation Apply,
// also flips that Recommendation back to status='pending' so the
// dashboard pulse re-surfaces it.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;
  const { id } = await params;

  const change = await prisma.gameplanChange.findFirst({
    where: { id, userId },
    select: {
      id: true,
      programId: true,
      field: true,
      oldValue: true,
      newValue: true,
      recommendationId: true,
      recommendation: { select: { goalId: true } },
    },
  });
  if (!change) return NextResponse.json({ error: "Change not found" }, { status: 404 });

  // Run the inverse mutation — same dispatcher, swap newValue ←→ oldValue.
  try {
    await applyInverse({
      userId,
      programId: change.programId,
      goalId: change.recommendation?.goalId ?? null,
      field: change.field,
      newValue: change.oldValue,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Undo failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Append a new audit row capturing the undo (oldValue/newValue swapped).
  const undoRow = await prisma.gameplanChange.create({
    data: {
      userId,
      programId: change.programId,
      source: "MANUAL_EDIT",
      field: change.field,
      oldValue: change.newValue as never,
      newValue: change.oldValue as never,
      reason: `Undo of change ${change.id}`,
      // Don't link the undo back to the rec — it's a separate user action.
    },
    select: { id: true, field: true, createdAt: true },
  });

  // If the original change came from a rec Apply, flip that rec back to pending.
  if (change.recommendationId) {
    await prisma.recommendation.update({
      where: { id: change.recommendationId },
      data: { status: "pending", resolvedAt: null },
    });
  }

  return NextResponse.json({
    undoChange: { ...undoRow, createdAt: undoRow.createdAt.toISOString() },
    revertedRecommendationId: change.recommendationId,
  });
}

/* ─── Inverse dispatcher (mirror of /apply route) ────────── */

interface InverseArgs {
  userId: string;
  programId: string | null;
  goalId: string | null;
  field: string;
  newValue: unknown; // The value we want to restore.
}

async function applyInverse(args: InverseArgs): Promise<void> {
  const { field } = args;
  if (field === "nutrition.calories" || field === "nutrition.protein") {
    await applyNutrition(args, field === "nutrition.calories" ? "calories" : "protein");
    return;
  }
  if (field.startsWith("lifestyle.") && field.endsWith(".target")) {
    const key = field.slice("lifestyle.".length, -".target".length);
    await applyLifestyleTarget(args, key);
    return;
  }
  if (field === "goal.targetDate") {
    await applyGoalTargetDate(args);
    return;
  }
  throw new Error(`Field "${field}" not in the dispatcher — can't undo`);
}

async function applyNutrition(
  { userId, newValue }: InverseArgs,
  column: "calories" | "protein",
) {
  const value = coerceNumberOrNull(newValue);
  const existing = await prisma.nutritionTarget.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) throw new Error("No NutritionTarget exists for this user");
  await prisma.nutritionTarget.update({
    where: { id: existing.id },
    data: { [column]: value },
  });
}

async function applyLifestyleTarget(
  { userId, programId, newValue }: InverseArgs,
  key: string,
) {
  const value = coerceNumberOrNull(newValue);
  if (value == null) throw new Error("Can't restore a null lifestyle target");
  const existing = await prisma.lifestyleTarget.findFirst({
    where: {
      userId,
      key,
      ...(programId ? { OR: [{ programId }, { programId: null }] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) throw new Error(`No LifestyleTarget for key "${key}"`);
  await prisma.lifestyleTarget.update({
    where: { id: existing.id },
    data: { value },
  });
}

async function applyGoalTargetDate({ userId, goalId, newValue }: InverseArgs) {
  if (!goalId) throw new Error("Goal id missing");
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("Goal not found");
  if (newValue == null) {
    await prisma.goal.update({ where: { id: existing.id }, data: { targetDate: null } });
    return;
  }
  const d = typeof newValue === "string" ? new Date(newValue) : null;
  if (!d || Number.isNaN(d.getTime())) throw new Error("Couldn't coerce undo date");
  await prisma.goal.update({ where: { id: existing.id }, data: { targetDate: d } });
}

function coerceNumberOrNull(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  throw new Error(`Couldn't coerce a number from ${JSON.stringify(value)}`);
}
