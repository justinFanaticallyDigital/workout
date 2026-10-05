import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { SAVED_MEAL_INCLUDE, normalizeItems, normalizeMealType } from "@/lib/api/saved-meals";

export const dynamic = "force-dynamic";

/** GET /api/nutrition/saved-meals — My Meals, with items, template and day-usage count. */

export async function GET() {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const meals = await prisma.savedMeal.findMany({ where: { userId }, include: SAVED_MEAL_INCLUDE, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ meals });
}

/**

 * POST /api/nutrition/saved-meals

 * { name, mealType?, templateId?, notes?, items: [{ foodItemId, quantity, role? }] }

 */

export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const items = normalizeItems(body.items ?? []);
  if (!items) return NextResponse.json({ error: "items must be [{ foodItemId, quantity, role? }]" }, { status: 400 });
  const mealType = normalizeMealType(body.mealType);
  if (mealType === undefined && body.mealType !== undefined) return NextResponse.json({ error: "Invalid mealType" }, { status: 400 });

  const meal = await prisma.savedMeal.create({
    data: {
      userId,
      name,
      mealType: mealType ?? null,
      templateId: typeof body.templateId === "string" ? body.templateId : null,
      notes: body.notes ? String(body.notes).trim() : null,
      items: { create: items.map((it, i) => ({ ...it, sortOrder: i })) },
    },
    include: SAVED_MEAL_INCLUDE,
  });
  return NextResponse.json(meal, { status: 201 });
}
