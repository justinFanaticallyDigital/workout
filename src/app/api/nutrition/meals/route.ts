import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/meals?date=2026-03-17
 * Returns all meals for a given date with items and food data.
 */
export async function GET(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const meals = await prisma.meal.findMany({
    where: {
      userId,
      date: new Date(dateStr),
    },
    include: {
      items: {
        include: {
          foodItem: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Calculate daily totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of meals) {
    for (const item of meal.items) {
      const qty = Number(item.quantity);
      const servingRatio = qty; // quantity is in servings
      totalCalories += Number(item.foodItem.calories) * servingRatio;
      totalProtein += Number(item.foodItem.protein) * servingRatio;
      totalCarbs += Number(item.foodItem.carbs) * servingRatio;
      totalFat += Number(item.foodItem.fat) * servingRatio;
    }
  }

  return NextResponse.json({
    meals,
    totals: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    },
  });
}

/**
 * POST /api/nutrition/meals
 * Create a meal with items.
 */
export async function POST(request: NextRequest) {
  const [userId, authError] = await requireAuth();
  if (authError) return authError;
  const body = await request.json();

  if (!body.date || !body.mealType) {
    return NextResponse.json(
      { error: "date and mealType are required" },
      { status: 400 }
    );
  }

  // If food items are included, ensure they exist in the DB first
  const items: { foodItemId: string; quantity: number; sortOrder: number }[] = [];
  if (body.items && Array.isArray(body.items)) {
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      let foodItemId = item.foodItemId;

      // If no foodItemId, create the food item from inline data
      if (!foodItemId && item.food) {
        const food = await prisma.foodItem.create({
          data: {
            userId: item.food.source === "custom" ? userId : null,
            name: item.food.name,
            brand: item.food.brand ?? null,
            barcode: item.food.barcode ?? null,
            servingSize: item.food.servingSize ?? 100,
            servingUnit: item.food.servingUnit ?? "g",
            calories: item.food.calories ?? 0,
            protein: item.food.protein ?? 0,
            carbs: item.food.carbs ?? 0,
            fat: item.food.fat ?? 0,
            source: item.food.source ?? "custom",
            externalId: item.food.externalId ?? null,
            isCustom: item.food.source === "custom",
          },
        });
        foodItemId = food.id;
      }

      if (foodItemId) {
        items.push({
          foodItemId,
          quantity: item.quantity ?? 1,
          sortOrder: i,
        });
      }
    }
  }

  const meal = await prisma.meal.create({
    data: {
      userId,
      date: new Date(body.date),
      mealType: body.mealType,
      notes: body.notes ?? null,
      items: {
        create: items,
      },
    },
    include: {
      items: {
        include: { foodItem: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json(meal, { status: 201 });
}
