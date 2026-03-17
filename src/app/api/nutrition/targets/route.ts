import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/targets
 * Returns the user's active nutrition target.
 */
export async function GET() {
  const userId = await requireAuthUserId();

  const target = await prisma.nutritionTarget.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ target });
}

/**
 * POST /api/nutrition/targets
 * Create or update nutrition targets.
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  // Deactivate existing targets
  await prisma.nutritionTarget.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const target = await prisma.nutritionTarget.create({
    data: {
      userId,
      label: body.label ?? "Default",
      calories: body.calories ?? null,
      protein: body.protein ?? null,
      carbs: body.carbs ?? null,
      fat: body.fat ?? null,
      isActive: true,
    },
  });

  return NextResponse.json(target, { status: 201 });
}
