import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/plans/[id]
 * Get a single meal plan with all days, meals, and items.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
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
 * DELETE /api/nutrition/plans/[id]
 * Delete a meal plan and all associated data.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuthUserId();
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
