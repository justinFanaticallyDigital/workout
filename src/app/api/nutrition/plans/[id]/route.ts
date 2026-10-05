import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { PLAN_INCLUDE, filterOwnDays, normalizeDayIds } from "@/lib/api/nutrition-plans";

export const dynamic = "force-dynamic";

async function own(userId: string, id: string) {
  return prisma.mealPlan.findFirst({ where: { id, userId }, select: { id: true } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const plan = await prisma.mealPlan.findFirst({ where: { id, userId }, include: PLAN_INCLUDE });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  return NextResponse.json(plan);
}

/** PATCH — { name?, isActive?, savedDayIds? } · savedDayIds replaces the day order. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await own(userId, id))) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const ids = body.savedDayIds !== undefined ? normalizeDayIds(body.savedDayIds) : undefined;
  if (body.savedDayIds !== undefined && !ids) return NextResponse.json({ error: "savedDayIds must be an array of ids" }, { status: 400 });
  if (body.name !== undefined && !String(body.name).trim()) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  const dayIds = ids ? await filterOwnDays(userId, ids) : undefined;

  const plan = await prisma.mealPlan.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(dayIds && {
        days: dayIds.length,
        planDays: { deleteMany: {}, create: dayIds.map((savedDayId, i) => ({ dayNumber: i + 1, savedDayId })) },
      }),
    },
    include: PLAN_INCLUDE,
  });
  return NextResponse.json(plan);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  if (!(await own(userId, id))) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  await prisma.mealPlan.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
