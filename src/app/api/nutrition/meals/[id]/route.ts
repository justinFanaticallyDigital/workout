import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * DELETE /api/nutrition/meals/[id]
 * Delete a meal and its items.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;

  const meal = await prisma.meal.findUnique({
    where: { id, userId },
    select: { id: true },
  });
  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  }

  await prisma.meal.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}

/**
 * PATCH /api/nutrition/meals/[id]
 * Add an item to an existing meal.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { id } = await params;
  const body = await request.json();

  const meal = await prisma.meal.findUnique({
    where: { id, userId },
    select: { id: true },
  });
  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 });
  }

  // Add item to meal
  if (body.addItem) {
    let foodItemId = body.addItem.foodItemId;

    // Create food if it doesn't exist yet (from external search result)
    if (!foodItemId && body.addItem.food) {
      const food = await prisma.foodItem.create({
        data: {
          userId: body.addItem.food.source === "custom" ? userId : null,
          name: body.addItem.food.name,
          brand: body.addItem.food.brand ?? null,
          barcode: body.addItem.food.barcode ?? null,
          servingSize: body.addItem.food.servingSize ?? 100,
          servingUnit: body.addItem.food.servingUnit ?? "g",
          calories: body.addItem.food.calories ?? 0,
          protein: body.addItem.food.protein ?? 0,
          carbs: body.addItem.food.carbs ?? 0,
          fat: body.addItem.food.fat ?? 0,
          source: body.addItem.food.source ?? "custom",
          externalId: body.addItem.food.externalId ?? null,
          isCustom: body.addItem.food.source === "custom",
        },
      });
      foodItemId = food.id;
    }

    if (foodItemId) {
      await prisma.mealItem.create({
        data: {
          mealId: id,
          foodItemId,
          quantity: body.addItem.quantity ?? 1,
          sortOrder: 0,
        },
      });
    }
  }

  // Remove item from meal
  if (body.removeItemId) {
    await prisma.mealItem.delete({
      where: { id: body.removeItemId },
    });
  }

  // Return updated meal
  const updated = await prisma.meal.findUnique({
    where: { id },
    include: {
      items: {
        include: { foodItem: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(updated);
}
