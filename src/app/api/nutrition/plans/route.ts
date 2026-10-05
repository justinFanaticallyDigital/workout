import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { PLAN_INCLUDE, normalizeDayIds, filterOwnDays } from "@/lib/api/nutrition-plans";

export const dynamic = "force-dynamic";

/** GET /api/nutrition/plans?active=1 */

export async function GET(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const activeOnly = request.nextUrl.searchParams.get("active") === "1";
  const plans = await prisma.mealPlan.findMany({
    where: { userId, ...(activeOnly ? { isActive: true } : {}) },
    include: PLAN_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ plans });
}

/** POST /api/nutrition/plans  { name, savedDayIds?: string[] } */

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const ids = body.savedDayIds !== undefined ? normalizeDayIds(body.savedDayIds) : [];
  if (!ids) return NextResponse.json({ error: "savedDayIds must be an array of ids" }, { status: 400 });
  const dayIds = await filterOwnDays(userId, ids);

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      name,
      days: dayIds.length,
      isActive: true,
      planDays: { create: dayIds.map((savedDayId, i) => ({ dayNumber: i + 1, savedDayId })) },
    },
    include: PLAN_INCLUDE,
  });
  return NextResponse.json(plan, { status: 201 });
}
