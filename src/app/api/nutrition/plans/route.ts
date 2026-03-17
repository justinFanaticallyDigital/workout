import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/plans
 * List all meal plans for the user.
 */
export async function GET() {
  const userId = await requireAuthUserId();

  const plans = await prisma.mealPlan.findMany({
    where: { userId },
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ plans });
}

/**
 * POST /api/nutrition/plans
 * Create a new meal plan (empty shell).
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      name: body.name.trim(),
      days: body.days ?? 7,
      calorieTarget: body.calorieTarget ?? null,
      proteinPct: body.proteinPct ?? null,
      carbsPct: body.carbsPct ?? null,
      fatPct: body.fatPct ?? null,
      mealsPerDay: body.mealsPerDay ?? 3,
      preferences: body.preferences ?? null,
      isActive: true,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
