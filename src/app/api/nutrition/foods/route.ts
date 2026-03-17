import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

/**
 * GET /api/nutrition/foods?search=chicken&barcode=123
 * Search local food database + optionally USDA FoodData Central.
 */
export async function GET(request: NextRequest) {
  const userId = await requireAuthUserId();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const barcode = searchParams.get("barcode") ?? "";

  // Search by barcode first
  if (barcode) {
    const food = await prisma.foodItem.findFirst({
      where: { barcode },
    });
    if (food) {
      return NextResponse.json({ foods: [food], source: "local" });
    }
    // Try USDA/Open Food Facts lookup
    try {
      const offRes = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
      );
      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData.status === 1 && offData.product) {
          const p = offData.product;
          const n = p.nutriments ?? {};
          const food = {
            id: null,
            name: p.product_name ?? "Unknown",
            brand: p.brands ?? null,
            barcode,
            servingSize: p.serving_quantity ?? 100,
            servingUnit: "g",
            calories: n["energy-kcal_100g"] ?? 0,
            protein: n.proteins_100g ?? 0,
            carbs: n.carbohydrates_100g ?? 0,
            fat: n.fat_100g ?? 0,
            fiber: n.fiber_100g ?? null,
            sugar: n.sugars_100g ?? null,
            sodium: n.sodium_100g ? n.sodium_100g * 1000 : null, // convert to mg
            source: "openfoodfacts",
            externalId: barcode,
          };
          return NextResponse.json({ foods: [food], source: "openfoodfacts" });
        }
      }
    } catch {
      // External lookup failed, continue
    }
    return NextResponse.json({ foods: [], source: "none" });
  }

  // Search by name
  if (search.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  // Search local database (user's custom foods + global cached foods)
  const localFoods = await prisma.foodItem.findMany({
    where: {
      name: { contains: search, mode: "insensitive" },
      OR: [{ userId }, { userId: null }, { isCustom: false }],
    },
    take: 20,
    orderBy: { name: "asc" },
  });

  // If we have enough local results, return them
  if (localFoods.length >= 10) {
    return NextResponse.json({ foods: localFoods, source: "local" });
  }

  // Supplement with USDA FoodData Central (free API, no key needed for basic search)
  let usdaFoods: typeof localFoods = [];
  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(search)}&pageSize=10&dataType=Foundation,SR%20Legacy&api_key=DEMO_KEY`
    );
    if (usdaRes.ok) {
      const usdaData = await usdaRes.json();
      usdaFoods = (usdaData.foods ?? []).map((f: Record<string, unknown>) => {
        const nutrients = (f.foodNutrients ?? []) as { nutrientName: string; value: number }[];
        const getNutrient = (name: string) =>
          nutrients.find((n) => n.nutrientName === name)?.value ?? 0;
        return {
          id: null,
          name: f.description as string,
          brand: f.brandName ?? null,
          barcode: null,
          servingSize: 100,
          servingUnit: "g",
          calories: getNutrient("Energy"),
          protein: getNutrient("Protein"),
          carbs: getNutrient("Carbohydrate, by difference"),
          fat: getNutrient("Total lipid (fat)"),
          fiber: getNutrient("Fiber, total dietary") || null,
          sugar: getNutrient("Sugars, total including NLEA") || null,
          sodium: getNutrient("Sodium, Na") || null,
          source: "usda",
          externalId: String(f.fdcId),
        };
      });
    }
  } catch {
    // USDA lookup failed, use local only
  }

  // Merge: local first, then USDA (deduplicated by name)
  const localNames = new Set(localFoods.map((f) => f.name.toLowerCase()));
  const merged = [
    ...localFoods,
    ...usdaFoods.filter((f) => !localNames.has((f.name as string).toLowerCase())),
  ];

  return NextResponse.json({ foods: merged.slice(0, 20), source: "mixed" });
}

/**
 * POST /api/nutrition/foods
 * Create a custom food item (or cache a USDA/OFF food).
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const food = await prisma.foodItem.create({
    data: {
      userId: body.source === "custom" ? userId : null,
      name: body.name.trim(),
      brand: body.brand ?? null,
      barcode: body.barcode ?? null,
      servingSize: body.servingSize ?? 100,
      servingUnit: body.servingUnit ?? "g",
      calories: body.calories ?? 0,
      protein: body.protein ?? 0,
      carbs: body.carbs ?? 0,
      fat: body.fat ?? 0,
      fiber: body.fiber ?? null,
      sugar: body.sugar ?? null,
      sodium: body.sodium ?? null,
      source: body.source ?? "custom",
      externalId: body.externalId ?? null,
      isCustom: body.source === "custom",
    },
  });

  return NextResponse.json(food, { status: 201 });
}
