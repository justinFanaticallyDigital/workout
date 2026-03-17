import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/targets
 * Returns the user's active nutrition target.
 * Supports ?blockId= or ?goalId= to get block/goal-specific targets.
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuthUserId();
  const { searchParams } = new URL(request.url);
  const blockId = searchParams.get("blockId");
  const goalId = searchParams.get("goalId");

  // Try block-specific target first, then goal-specific, then global active
  let target = null;

  if (blockId) {
    target = await prisma.nutritionTarget.findFirst({
      where: { userId, blockId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!target && goalId) {
    target = await prisma.nutritionTarget.findFirst({
      where: { userId, goalId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!target) {
    target = await prisma.nutritionTarget.findFirst({
      where: { userId, isActive: true, blockId: null, goalId: null },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ target });
}

/**
 * POST /api/nutrition/targets
 * Create or update nutrition targets.
 * Supports blockId and goalId for scoped targets.
 * Supports autoCalc: true to auto-calculate based on body weight + goal.
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  let calories = body.calories ?? null;
  let protein = body.protein ?? null;
  let carbs = body.carbs ?? null;
  let fat = body.fat ?? null;

  // Auto-calculate macros from body weight and goal type
  if (body.autoCalc) {
    const latestWeight = await prisma.bodyMetric.findFirst({
      where: { userId, weight: { not: null } },
      orderBy: { date: "desc" },
      select: { weight: true },
    });

    if (latestWeight?.weight) {
      const weightLbs = Number(latestWeight.weight);
      const weightKg = weightLbs * 0.453592;
      const bmr = 10 * weightKg + 6.25 * 175 - 5 * 30 + 5; // Mifflin-St Jeor (estimated height/age)
      const tdee = bmr * 1.55; // Moderate activity

      const goalType = body.goalType || "maintenance";
      if (goalType === "bulk" || goalType === "weight") {
        calories = Math.round(tdee + 300);
        protein = Math.round(weightLbs * 1.0);
        fat = Math.round((calories * 0.25) / 9);
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
      } else if (goalType === "cut" || goalType === "bodyweight") {
        calories = Math.round(tdee - 400);
        protein = Math.round(weightLbs * 1.2);
        fat = Math.round((calories * 0.25) / 9);
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
      } else {
        // maintenance
        calories = Math.round(tdee);
        protein = Math.round(weightLbs * 0.8);
        fat = Math.round((calories * 0.3) / 9);
        carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
      }
    }
  }

  // Deactivate existing targets with same scope
  const deactivateWhere: Record<string, unknown> = { userId, isActive: true };
  if (body.blockId) {
    deactivateWhere.blockId = body.blockId;
  } else if (body.goalId) {
    deactivateWhere.goalId = body.goalId;
  } else {
    deactivateWhere.blockId = null;
    deactivateWhere.goalId = null;
  }

  await prisma.nutritionTarget.updateMany({
    where: deactivateWhere,
    data: { isActive: false },
  });

  const target = await prisma.nutritionTarget.create({
    data: {
      userId,
      label: body.label ?? "Default",
      calories,
      protein,
      carbs,
      fat,
      blockId: body.blockId ?? null,
      goalId: body.goalId ?? null,
      isActive: true,
    },
  });

  return NextResponse.json(target, { status: 201 });
}
