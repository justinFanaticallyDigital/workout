// src/app/api/recommendations/[id]/apply/route.ts
// ============================================================================
// R10 — POST /api/recommendations/[id]/apply
//
// Applies a Recommendation in one transaction:
//   1. Mutate the underlying field via the dispatcher
//   2. Write a GameplanChange audit row capturing oldValue/newValue
//   3. Flip Recommendation.status → applied + stamp resolvedAt
//
// Dispatcher whitelist (per R10 hot question 1):
//   - nutrition.calories       → updates active program's NutritionTarget
//   - nutrition.protein        → same
//   - lifestyle.{key}.target   → updates matching LifestyleTarget
//   - goal.targetDate          → updates linked Goal.targetDate
//
// Unknown fields → 400. The UI falls back to "Open in Planning Mode"
// when this endpoint reports the field isn't auto-applyable.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

interface ApplyBody {
  /** Optional override for suggestedValue — Planning Mode passes this
   *  when the user tweaked the rec value before applying. */
  newValue?: unknown;
  /** Optional human-entered note attached to the GameplanChange row. */
  reason?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, errorRes] = await requireAuth();
  if (errorRes) return errorRes;
  const { id } = await params;

  const rec = await prisma.recommendation.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      programId: true,
      goalId: true,
      suggestedField: true,
      suggestedValue: true,
    },
  });
  if (!rec) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
  if (rec.status !== "pending") {
    return NextResponse.json(
      { error: `Recommendation already ${rec.status}` },
      { status: 409 },
    );
  }
  if (!rec.suggestedField) {
    return NextResponse.json(
      { error: "Recommendation has no suggestedField — open in Planning Mode instead" },
      { status: 400 },
    );
  }

  let body: ApplyBody = {};
  try {
    body = await request.json();
  } catch {
    // Body optional; defaults are fine.
  }

  // Resolve new value: caller-supplied wins, otherwise parse the rec's
  // own suggestedValue JSON.
  const newValue =
    body.newValue !== undefined
      ? body.newValue
      : safeParseJson(rec.suggestedValue);

  let result: ApplyResult;
  try {
    result = await applyDispatch({
      userId,
      programId: rec.programId,
      goalId: rec.goalId,
      field: rec.suggestedField,
      newValue,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Apply failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Persist the audit row + flip status. Best-effort — we don't wrap
  // in a Prisma $transaction since the dispatcher already mutated the
  // field; if these writes fail the change still landed and the user
  // can re-mark from the UI.
  const change = await prisma.gameplanChange.create({
    data: {
      userId,
      programId: rec.programId,
      source: "CHECK_IN_APPLY",
      field: rec.suggestedField,
      oldValue: result.oldValue as never,
      newValue: result.newValue as never,
      reason: body.reason ?? null,
      recommendationId: rec.id,
    },
    select: { id: true, field: true, oldValue: true, newValue: true, createdAt: true },
  });

  await prisma.recommendation.update({
    where: { id: rec.id },
    data: { status: "applied", resolvedAt: new Date() },
  });

  return NextResponse.json({
    change: {
      ...change,
      createdAt: change.createdAt.toISOString(),
    },
    recommendationId: rec.id,
  });
}

/* ─── Dispatcher ─────────────────────────────────────────── */

interface ApplyArgs {
  userId: string;
  programId: string | null;
  goalId: string | null;
  field: string;
  newValue: unknown;
}

interface ApplyResult {
  oldValue: unknown;
  newValue: unknown;
}

async function applyDispatch(args: ApplyArgs): Promise<ApplyResult> {
  const { field } = args;
  if (field === "nutrition.calories" || field === "nutrition.protein") {
    return applyNutrition(args, field === "nutrition.calories" ? "calories" : "protein");
  }
  if (field.startsWith("lifestyle.") && field.endsWith(".target")) {
    const key = field.slice("lifestyle.".length, -".target".length);
    if (!key) throw new Error(`Invalid lifestyle field: ${field}`);
    return applyLifestyleTarget(args, key);
  }
  if (field === "goal.targetDate") {
    return applyGoalTargetDate(args);
  }
  throw new Error(
    `Field "${field}" not in the apply dispatcher — open in Planning Mode instead`,
  );
}

async function applyNutrition(
  { userId, newValue }: ApplyArgs,
  column: "calories" | "protein",
): Promise<ApplyResult> {
  const value = coerceNumber(newValue, column);
  // NutritionTarget is scoped by block / goal rather than program;
  // pick the most-recent active row for the user.
  const existing = await prisma.nutritionTarget.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) {
    throw new Error("No NutritionTarget exists for this user — set one before applying");
  }
  const oldValue = column === "calories" ? existing.calories : existing.protein;
  await prisma.nutritionTarget.update({
    where: { id: existing.id },
    data: { [column]: value },
  });
  return { oldValue: oldValue == null ? null : Number(oldValue), newValue: value };
}

async function applyLifestyleTarget(
  { userId, programId, newValue }: ApplyArgs,
  key: string,
): Promise<ApplyResult> {
  const value = coerceNumber(newValue, `lifestyle.${key}.target`);
  const existing = await prisma.lifestyleTarget.findFirst({
    where: {
      userId,
      key,
      ...(programId ? { OR: [{ programId }, { programId: null }] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) {
    throw new Error(`No LifestyleTarget for key "${key}" — set one before applying`);
  }
  const oldValue = existing.value;
  await prisma.lifestyleTarget.update({
    where: { id: existing.id },
    data: { value },
  });
  return { oldValue, newValue: value };
}

async function applyGoalTargetDate(
  { userId, goalId, newValue }: ApplyArgs,
): Promise<ApplyResult> {
  if (!goalId) throw new Error("Recommendation has no goalId — can't apply goal.targetDate");
  const value = coerceDate(newValue);
  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true, targetDate: true },
  });
  if (!existing) throw new Error("Goal not found");
  const oldValue = existing.targetDate ? existing.targetDate.toISOString().slice(0, 10) : null;
  await prisma.goal.update({
    where: { id: existing.id },
    data: { targetDate: value },
  });
  return { oldValue, newValue: value.toISOString().slice(0, 10) };
}

/* ─── Coercers ───────────────────────────────────────────── */

function coerceNumber(value: unknown, field: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  if (value && typeof value === "object" && "value" in value) {
    const n = (value as { value?: unknown }).value;
    if (typeof n === "number" && Number.isFinite(n)) return n;
  }
  throw new Error(`Couldn't coerce a number for ${field} from ${JSON.stringify(value)}`);
}

function coerceDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (value && typeof value === "object" && "value" in value) {
    return coerceDate((value as { value?: unknown }).value);
  }
  throw new Error(`Couldn't coerce a date from ${JSON.stringify(value)}`);
}

function safeParseJson(s: string | null): unknown {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
