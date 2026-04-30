import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { GoalType, GoalStatus } from "@/generated/prisma/enums";

/**
 * R7 — per-goal PATCH endpoint required by Planning Mode's GoalCard
 * editor (target value / target date / metric / etc.). The collection
 * endpoint at `/api/goals` only supports POST (create); R7 sandbox
 * Apply flow needs an idempotent per-row update.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const goal = await prisma.goal.findUnique({
    where: { id, userId },
    select: { id: true },
  });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  let body: {
    title?: string;
    description?: string | null;
    type?: GoalType;
    metric?: string | null;
    startValue?: number | null;
    targetValue?: number | null;
    targetUnit?: string | null;
    targetDate?: string | null;
    status?: GoalStatus;
    priority?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.metric !== undefined && { metric: body.metric }),
      ...(body.startValue !== undefined && { startValue: body.startValue }),
      ...(body.targetValue !== undefined && { targetValue: body.targetValue }),
      ...(body.targetUnit !== undefined && { targetUnit: body.targetUnit }),
      ...(body.targetDate !== undefined && {
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
      }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
    },
  });

  return NextResponse.json(updated);
}

/**
 * Read a single Goal — used by Planning Mode's clone-on-open
 * hydration when a recommendation card deep-links into Planning
 * pre-focused on a specific goal.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id, userId } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  return NextResponse.json(goal);
}
