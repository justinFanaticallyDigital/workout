import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUserId } from "@/lib/auth-helpers";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/**
 * POST /api/nutrition/plans/generate
 * Generate a meal plan from templates based on macro targets.
 */
export async function POST(request: NextRequest) {
  const userId = await requireAuthUserId();
  const body = await request.json();

  const {
    name,
    days = 7,
    calorieTarget,
    proteinPct = 30,
    carbsPct = 40,
    fatPct = 30,
    mealsPerDay = 3,
    preferences,
  } = body;

  if (!calorieTarget || calorieTarget < 800) {
    return NextResponse.json(
      { error: "calorieTarget must be at least 800" },
      { status: 400 }
    );
  }

  // Calculate macro gram targets
  const proteinGrams = Math.round((calorieTarget * (proteinPct / 100)) / 4);
  const carbsGrams = Math.round((calorieTarget * (carbsPct / 100)) / 4);
  const fatGrams = Math.round((calorieTarget * (fatPct / 100)) / 9);

  // Per-meal macro targets
  const perMealCals = Math.round(calorieTarget / mealsPerDay);
  const perMealProtein = Math.round(proteinGrams / mealsPerDay);
  const perMealCarbs = Math.round(carbsGrams / mealsPerDay);
  const perMealFat = Math.round(fatGrams / mealsPerDay);

  // Determine meal types based on mealsPerDay
  const mealTypes: MealType[] = getMealTypes(mealsPerDay);

  // Get or create template foods from our predefined database
  const templateFoods = await ensureTemplateFoods();

  // Build meal combos that hit target macros
  const dayMeals: GeneratedDay[] = [];
  for (let d = 0; d < days; d++) {
    const mealsForDay: GeneratedMeal[] = [];
    for (let m = 0; m < mealsPerDay; m++) {
      const mealType = mealTypes[m];
      const combo = pickMealCombo(
        templateFoods,
        mealType,
        perMealCals,
        perMealProtein,
        perMealCarbs,
        perMealFat,
        preferences,
        d * mealsPerDay + m // seed for variety
      );
      mealsForDay.push({ mealType, items: combo, sortOrder: m });
    }
    dayMeals.push({ dayNumber: d + 1, meals: mealsForDay });
  }

  // Create the plan in the database
  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      name: name || `${calorieTarget} cal Plan`,
      days,
      calorieTarget,
      proteinPct,
      carbsPct,
      fatPct,
      mealsPerDay,
      preferences: preferences || null,
      isActive: true,
      planDays: {
        create: dayMeals.map((day) => ({
          dayNumber: day.dayNumber,
          meals: {
            create: day.meals.map((meal) => ({
              mealType: meal.mealType,
              sortOrder: meal.sortOrder,
              items: {
                create: meal.items.map((item, idx) => ({
                  foodItemId: item.foodItemId,
                  quantity: item.quantity,
                  sortOrder: idx,
                })),
              },
            })),
          },
        })),
      },
    },
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

  return NextResponse.json(plan, { status: 201 });
}

// ─── Types ────────────────────────────────────────────────
interface GeneratedItem {
  foodItemId: string;
  quantity: number;
}

interface GeneratedMeal {
  mealType: MealType;
  items: GeneratedItem[];
  sortOrder: number;
}

interface GeneratedDay {
  dayNumber: number;
  meals: GeneratedMeal[];
}

interface TemplateFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  mealTypes: MealType[];
}

// ─── Helpers ──────────────────────────────────────────────
function getMealTypes(count: number): MealType[] {
  if (count <= 2) return ["breakfast", "dinner"] as MealType[];
  if (count === 3) return ["breakfast", "lunch", "dinner"] as MealType[];
  if (count === 4)
    return ["breakfast", "snack", "lunch", "dinner"] as MealType[];
  return ["breakfast", "snack", "lunch", "snack", "dinner"] as MealType[];
}

// Template food database with macro info and meal-type associations
const TEMPLATE_FOODS: Omit<TemplateFood, "id">[] = [
  // Proteins
  { name: "Chicken Breast (6oz)", calories: 280, protein: 52, carbs: 0, fat: 6, category: "protein", mealTypes: ["lunch", "dinner"] },
  { name: "Salmon Fillet (5oz)", calories: 290, protein: 36, carbs: 0, fat: 16, category: "protein", mealTypes: ["lunch", "dinner"] },
  { name: "Lean Ground Turkey (5oz)", calories: 240, protein: 38, carbs: 0, fat: 9, category: "protein", mealTypes: ["lunch", "dinner"] },
  { name: "Eggs (3 large)", calories: 210, protein: 18, carbs: 1, fat: 15, category: "protein", mealTypes: ["breakfast", "lunch"] },
  { name: "Greek Yogurt (1 cup)", calories: 130, protein: 22, carbs: 8, fat: 0, category: "protein", mealTypes: ["breakfast", "snack"] },
  { name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1, category: "protein", mealTypes: ["breakfast", "snack"] },
  { name: "Cottage Cheese (1 cup)", calories: 220, protein: 28, carbs: 8, fat: 10, category: "protein", mealTypes: ["breakfast", "snack"] },
  { name: "Tuna (1 can, drained)", calories: 190, protein: 42, carbs: 0, fat: 1, category: "protein", mealTypes: ["lunch"] },
  { name: "Lean Beef Steak (5oz)", calories: 300, protein: 44, carbs: 0, fat: 14, category: "protein", mealTypes: ["dinner"] },
  { name: "Shrimp (6oz)", calories: 170, protein: 36, carbs: 1, fat: 2, category: "protein", mealTypes: ["lunch", "dinner"] },

  // Carbs
  { name: "Brown Rice (1 cup cooked)", calories: 215, protein: 5, carbs: 45, fat: 2, category: "carb", mealTypes: ["lunch", "dinner"] },
  { name: "Oatmeal (1 cup cooked)", calories: 150, protein: 5, carbs: 27, fat: 3, category: "carb", mealTypes: ["breakfast"] },
  { name: "Sweet Potato (1 medium)", calories: 103, protein: 2, carbs: 24, fat: 0, category: "carb", mealTypes: ["lunch", "dinner"] },
  { name: "Whole Wheat Bread (2 slices)", calories: 160, protein: 8, carbs: 28, fat: 2, category: "carb", mealTypes: ["breakfast", "lunch"] },
  { name: "Banana (1 medium)", calories: 105, protein: 1, carbs: 27, fat: 0, category: "carb", mealTypes: ["breakfast", "snack"] },
  { name: "Quinoa (1 cup cooked)", calories: 222, protein: 8, carbs: 39, fat: 4, category: "carb", mealTypes: ["lunch", "dinner"] },
  { name: "White Rice (1 cup cooked)", calories: 205, protein: 4, carbs: 45, fat: 0, category: "carb", mealTypes: ["lunch", "dinner"] },
  { name: "Mixed Berries (1 cup)", calories: 70, protein: 1, carbs: 17, fat: 0, category: "carb", mealTypes: ["breakfast", "snack"] },
  { name: "Apple (1 medium)", calories: 95, protein: 0, carbs: 25, fat: 0, category: "carb", mealTypes: ["snack"] },
  { name: "Pasta (1 cup cooked)", calories: 220, protein: 8, carbs: 43, fat: 1, category: "carb", mealTypes: ["lunch", "dinner"] },

  // Fats
  { name: "Avocado (1/2 medium)", calories: 120, protein: 1, carbs: 6, fat: 11, category: "fat", mealTypes: ["breakfast", "lunch", "dinner"] },
  { name: "Almonds (1oz)", calories: 160, protein: 6, carbs: 6, fat: 14, category: "fat", mealTypes: ["snack"] },
  { name: "Peanut Butter (2 tbsp)", calories: 190, protein: 7, carbs: 7, fat: 16, category: "fat", mealTypes: ["breakfast", "snack"] },
  { name: "Olive Oil (1 tbsp)", calories: 120, protein: 0, carbs: 0, fat: 14, category: "fat", mealTypes: ["lunch", "dinner"] },
  { name: "Walnuts (1oz)", calories: 185, protein: 4, carbs: 4, fat: 18, category: "fat", mealTypes: ["snack"] },
  { name: "Cheese (1oz cheddar)", calories: 110, protein: 7, carbs: 0, fat: 9, category: "fat", mealTypes: ["breakfast", "lunch", "snack"] },

  // Veggies (low cal, add freely)
  { name: "Mixed Salad Greens (2 cups)", calories: 15, protein: 1, carbs: 3, fat: 0, category: "veggie", mealTypes: ["lunch", "dinner"] },
  { name: "Broccoli (1 cup)", calories: 55, protein: 4, carbs: 11, fat: 0, category: "veggie", mealTypes: ["lunch", "dinner"] },
  { name: "Spinach (2 cups raw)", calories: 14, protein: 2, carbs: 2, fat: 0, category: "veggie", mealTypes: ["breakfast", "lunch", "dinner"] },
  { name: "Bell Peppers (1 medium)", calories: 30, protein: 1, carbs: 7, fat: 0, category: "veggie", mealTypes: ["lunch", "dinner", "snack"] },
];

async function ensureTemplateFoods(): Promise<TemplateFood[]> {
  const templateNames = TEMPLATE_FOODS.map((t) => t.name);

  // Batch fetch all existing template foods
  const existingFoods = await prisma.foodItem.findMany({
    where: { name: { in: templateNames }, source: "template" },
  });
  const existingByName = new Map(existingFoods.map((f) => [f.name, f]));

  // Create any missing template foods
  const missing = TEMPLATE_FOODS.filter((t) => !existingByName.has(t.name));
  if (missing.length > 0) {
    await prisma.foodItem.createMany({
      data: missing.map((tmpl) => ({
        name: tmpl.name,
        calories: tmpl.calories,
        protein: tmpl.protein,
        carbs: tmpl.carbs,
        fat: tmpl.fat,
        servingSize: 1,
        servingUnit: "serving",
        source: "template",
        isCustom: false,
      })),
      skipDuplicates: true,
    });

    // Re-fetch to get IDs of newly created foods
    const newFoods = await prisma.foodItem.findMany({
      where: { name: { in: missing.map((t) => t.name) }, source: "template" },
    });
    for (const f of newFoods) {
      existingByName.set(f.name, f);
    }
  }

  return TEMPLATE_FOODS.map((tmpl) => {
    const food = existingByName.get(tmpl.name)!;
    return {
      id: food.id,
      name: tmpl.name,
      calories: Number(food.calories),
      protein: Number(food.protein),
      carbs: Number(food.carbs),
      fat: Number(food.fat),
      category: tmpl.category,
      mealTypes: tmpl.mealTypes,
    };
  });
}

function pickMealCombo(
  foods: TemplateFood[],
  mealType: MealType,
  targetCals: number,
  targetProtein: number,
  _targetCarbs: number,
  _targetFat: number,
  preferences: string | null,
  seed: number
): GeneratedItem[] {
  // Filter foods appropriate for this meal type
  let eligible = foods.filter((f) => f.mealTypes.includes(mealType));

  // Apply dietary preferences filter
  if (preferences) {
    const prefs = preferences.toLowerCase();
    if (prefs.includes("vegetarian") || prefs.includes("vegan")) {
      const meatNames = ["chicken", "turkey", "beef", "salmon", "tuna", "shrimp"];
      eligible = eligible.filter(
        (f) => !meatNames.some((m) => f.name.toLowerCase().includes(m))
      );
    }
    if (prefs.includes("low carb") || prefs.includes("keto")) {
      eligible = eligible.filter(
        (f) => f.category !== "carb" || f.carbs < 15
      );
    }
  }

  // Pick 1 protein, 1 carb, 1 veggie, optionally 1 fat
  const proteins = eligible.filter((f) => f.category === "protein");
  const carbs = eligible.filter((f) => f.category === "carb");
  const fats = eligible.filter((f) => f.category === "fat");
  const veggies = eligible.filter((f) => f.category === "veggie");

  const items: GeneratedItem[] = [];
  let totalCals = 0;
  let totalProtein = 0;

  // Simple seeded selection for variety
  const pick = <T>(arr: T[], offset: number): T | undefined =>
    arr.length > 0 ? arr[(seed + offset) % arr.length] : undefined;

  // Add protein source
  const protein = pick(proteins, 0);
  if (protein) {
    // Scale quantity to hit protein target
    const qty = Math.max(0.5, Math.min(2, targetProtein / Math.max(1, protein.protein)));
    const roundedQty = Math.round(qty * 2) / 2; // Round to nearest 0.5
    items.push({ foodItemId: protein.id, quantity: roundedQty });
    totalCals += protein.calories * roundedQty;
    totalProtein += protein.protein * roundedQty;
  }

  // Add carb source
  const carb = pick(carbs, 1);
  if (carb) {
    const remainingCals = targetCals - totalCals;
    const qty = Math.max(0.5, Math.min(2, remainingCals / Math.max(1, carb.calories) * 0.6));
    const roundedQty = Math.round(qty * 2) / 2;
    items.push({ foodItemId: carb.id, quantity: roundedQty });
    totalCals += carb.calories * roundedQty;
  }

  // Add veggie
  const veggie = pick(veggies, 2);
  if (veggie) {
    items.push({ foodItemId: veggie.id, quantity: 1 });
    totalCals += veggie.calories;
  }

  // Add fat if we need more calories and protein is sufficient
  if (totalCals < targetCals * 0.8 && totalProtein >= targetProtein * 0.7) {
    const fat = pick(fats, 3);
    if (fat) {
      const remainingCals = targetCals - totalCals;
      const qty = Math.max(0.5, Math.min(2, remainingCals / Math.max(1, fat.calories)));
      const roundedQty = Math.round(qty * 2) / 2;
      items.push({ foodItemId: fat.id, quantity: roundedQty });
    }
  }

  return items;
}
