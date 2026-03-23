import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/plans/[id]
 * Get a single meal plan with all days, meals, and items.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const plan = await prisma.mealPlan.findFirst({
    where: { id, userId },
    include: {
      planDays: {
        include: {
          meals: {
            include: {
              items: { include: { foodItem: true } },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}

/**
 * PATCH /api/nutrition/plans/[id]
 * Update meal plan properties (name, macro targets, preferences, active status).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await request.json();

  const plan = await prisma.mealPlan.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const updated = await prisma.mealPlan.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.calorieTarget !== undefined && { calorieTarget: body.calorieTarget }),
      ...(body.proteinPct !== undefined && { proteinPct: body.proteinPct }),
      ...(body.carbsPct !== undefined && { carbsPct: body.carbsPct }),
      ...(body.fatPct !== undefined && { fatPct: body.fatPct }),
      ...(body.mealsPerDay !== undefined && { mealsPerDay: body.mealsPerDay }),
      ...(body.preferences !== undefined && { preferences: body.preferences }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/nutrition/plans/[id]
 * Delete a meal plan and all associated data.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const plan = await prisma.mealPlan.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  await prisma.mealPlan.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
