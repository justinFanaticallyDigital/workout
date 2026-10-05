/**
 * Seed the nutrition library from the Meal Construction Guide (v4).
 *
 *   npx tsx scripts/seed-meal-guide.ts --user you@example.com
 *
 * Writes three things:
 *   1. MealTemplate archetypes (5) with slots. The guide states a formula —
 *      Protein + Produce + Base/Add-In + Flavor — rather than named archetypes,
 *      so these five are authored from its rules (see ARCHETYPES).
 *   2. Library FoodItems (userId null, source "guide"): the guide's proteins,
 *      vegetables, fruit and add-ins with its calories/portions, plus its 16
 *      flavour profiles as low-calorie items, plus the extra ingredients the
 *      sample meals use. Macros the guide omits use standard values; edit freely.
 *   3. The guide's sample meals as SavedMeals for the user, frame slots filled.
 *
 * Idempotent: templates upsert by slug; foods match on (name, source "guide");
 * meals are created only when the user has no meal of that name.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MealSlotRole, type MealType } from "../src/generated/prisma/client";
import { resolveSeedUser } from "./lib/seed-user";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// ── 1. Archetypes ─────────────────────────────────────────────────────
type SlotSpec = { role: MealSlotRole; required: boolean; hint: string };
const ARCHETYPES: { slug: string; name: string; description: string; slots: SlotSpec[] }[] = [
  {
    slug: "plate",
    name: "Standard plate",
    description: "Protein + produce + a base or add-in + flavour. The guide's default meal.",
    slots: [
      { role: "protein", required: true, hint: "5–7 oz lean protein" },
      { role: "filling", required: true, hint: "Fill half the plate with produce" },
      { role: "carb", required: false, hint: "Start with ½ cup or less" },
      { role: "fat", required: false, hint: "Measure fats and oils" },
      { role: "flavor", required: true, hint: "Spices are free · measure sauces" },
    ],
  },
  {
    slug: "training-plate",
    name: "Training-day plate",
    description: "Carbs are strategic on training days — the base slot is required.",
    slots: [
      { role: "protein", required: true, hint: "5–7 oz lean protein" },
      { role: "filling", required: true, hint: "Fill half the plate with produce" },
      { role: "carb", required: true, hint: "Rice · potatoes · quinoa · beans" },
      { role: "fat", required: false, hint: "Measure fats and oils" },
      { role: "flavor", required: true, hint: "Add acid at the end" },
    ],
  },
  {
    slug: "low-carb-plate",
    name: "Low-carb plate",
    description: "You don't need carbs at every meal to lose fat — no base slot.",
    slots: [
      { role: "protein", required: true, hint: "5–7 oz lean protein" },
      { role: "filling", required: true, hint: "Roasted or sautéed veg reheats best" },
      { role: "fat", required: true, hint: "Avocado · olive oil · nuts" },
      { role: "flavor", required: true, hint: "Heat improves satiety" },
    ],
  },
  {
    slug: "bowl",
    name: "No-cook bowl",
    description: "Yogurt, cottage cheese or eggs with fruit, oats or granola and a sweet flavour.",
    slots: [
      { role: "protein", required: true, hint: "Greek yogurt · cottage cheese · eggs" },
      { role: "filling", required: true, hint: "Fruit — great for breakfast and snacks" },
      { role: "carb", required: true, hint: "Oats · granola" },
      { role: "fat", required: false, hint: "Nut butter · nuts and seeds" },
      { role: "flavor", required: true, hint: "Cinnamon · honey · vanilla" },
    ],
  },
  {
    slug: "snack",
    name: "Snack",
    description: "Protein first, then one of fruit or a small carb.",
    slots: [
      { role: "protein", required: true, hint: "Yogurt · cottage cheese · deli turkey" },
      { role: "filling", required: false, hint: "A piece of fruit" },
      { role: "carb", required: false, hint: "Crackers · toast" },
    ],
  },
];

// ── 2. Library foods ──────────────────────────────────────────────────
// [name, servingSize, servingUnit, kcal, protein, carbs, fat, kind]
type Kind = "protein" | "vegetable" | "fruit" | "carb" | "fat" | "flavor";
type FoodRow = [string, number, string, number, number, number, number, Kind];
const FOODS: FoodRow[] = [
  // Step 2 — Protein (5–7 oz; calories + protein from the guide)
  ["Chicken Breast", 6, "oz", 220, 44, 0, 4.5, "protein"],
  ["Ground Turkey (93–99%)", 6, "oz", 240, 38, 0, 9, "protein"],
  ["Lean Ground Beef", 6, "oz", 260, 33, 0, 13, "protein"],
  ["Shrimp", 6, "oz", 170, 38, 1, 2, "protein"],
  ["Salmon", 6, "oz", 300, 35, 0, 17, "protein"],
  ["Eggs + Egg Whites", 1, "serving", 220, 32, 2, 10, "protein"],
  ["Extra-Firm Tofu", 6, "oz", 220, 26, 5, 13, "protein"],
  ["Nonfat Greek Yogurt", 6, "oz", 120, 22, 8, 0, "protein"],
  ["Cottage Cheese", 6, "oz", 110, 16, 6, 2, "protein"],
  // Step 3 — Vegetables (per cup)
  ["Broccoli", 1, "cup", 55, 4, 11, 0.5, "vegetable"],
  ["Cauliflower Rice", 1, "cup", 25, 2, 5, 0, "vegetable"],
  ["Zucchini", 1, "cup", 20, 1.5, 4, 0, "vegetable"],
  ["Bell Peppers", 1, "cup", 40, 1.5, 9, 0, "vegetable"],
  ["Green Beans", 1, "cup", 45, 2, 10, 0, "vegetable"],
  ["Cabbage / Slaw", 1, "cup", 20, 1, 5, 0, "vegetable"],
  ["Spinach", 1, "cup", 10, 1, 1, 0, "vegetable"],
  ["Mushrooms", 1, "cup", 15, 2, 2, 0, "vegetable"],
  // Step 3 — Fruit
  ["Blueberries", 1, "cup", 85, 1, 21, 0.5, "fruit"],
  ["Strawberries", 1, "cup", 50, 1, 12, 0.5, "fruit"],
  ["Raspberries", 1, "cup", 65, 1.5, 15, 1, "fruit"],
  ["Banana", 1, "medium", 105, 1, 27, 0.5, "fruit"],
  ["Apple", 1, "medium", 95, 0.5, 25, 0.3, "fruit"],
  ["Mango", 1, "cup", 100, 1.5, 25, 0.5, "fruit"],
  ["Grapes", 1, "cup", 105, 1, 27, 0, "fruit"],
  ["Orange", 1, "medium", 65, 1, 16, 0, "fruit"],
  // Step 4 — Add-ins (guide portions)
  ["Oats", 0.5, "cup dry", 150, 5, 27, 3, "carb"],
  ["Granola", 0.25, "cup", 120, 3, 18, 5, "carb"],
  ["Rice", 0.5, "cup cooked", 110, 2, 23, 0, "carb"],
  ["Potatoes", 1, "medium", 120, 3, 27, 0, "carb"],
  ["Quinoa", 0.5, "cup cooked", 110, 4, 20, 2, "carb"],
  ["Beans / Lentils", 0.5, "cup", 130, 8, 22, 0.5, "carb"],
  ["Bread / Toast", 1, "slice", 80, 3, 15, 1, "carb"],
  ["Avocado", 0.5, "avocado", 120, 1.5, 6, 11, "fat"],
  ["Olive Oil", 1, "tsp", 40, 0, 0, 4.5, "fat"],
  ["Nut Butter", 1, "tbsp", 95, 3.5, 3, 8, "fat"],
  ["Feta / Parmesan", 1, "tbsp", 35, 2.5, 0.5, 2.5, "fat"],
  ["Nuts / Seeds", 1, "tbsp", 80, 2.5, 2, 7, "fat"],
  // Step 5 — Flavour profiles (one serving of seasonings + sauce/acid + extras)
  ["Garlic Lemon", 1, "serving", 10, 0, 2, 0, "flavor"],
  ["Mediterranean", 1, "serving", 25, 1, 1, 2, "flavor"],
  ["Mexican / Taco", 1, "serving", 20, 0.5, 4, 0, "flavor"],
  ["Southwest", 1, "serving", 10, 0, 2, 0, "flavor"],
  ["Italian Herb", 1, "serving", 25, 1, 3, 1, "flavor"],
  ["Asian Ginger", 1, "serving", 20, 1, 2, 1, "flavor"],
  ["Teriyaki-Style", 1, "serving", 25, 0.5, 5, 0, "flavor"],
  ["Soy Garlic", 1, "serving", 10, 1, 1, 0, "flavor"],
  ["Chili Lime", 1, "serving", 10, 0, 2, 0, "flavor"],
  ["Buffalo", 1, "serving", 15, 1, 1, 0.5, "flavor"],
  ["BBQ (Light)", 1, "serving", 15, 0, 3, 0, "flavor"],
  ["Curry", 1, "serving", 25, 0.5, 3, 1, "flavor"],
  ["Greek Yogurt Herb", 1, "serving", 25, 2, 2, 0.5, "flavor"],
  ["Dijon Herb", 1, "serving", 15, 0.5, 1, 0.5, "flavor"],
  ["Smoky Paprika", 1, "serving", 5, 0, 1, 0, "flavor"],
  ["Salt & Pepper", 1, "serving", 0, 0, 0, 0, "flavor"],
  ["Honey & Vanilla", 1, "tsp", 20, 0, 6, 0, "flavor"],
  ["Cinnamon", 1, "tsp", 5, 0, 2, 0, "flavor"],
  // Extra ingredients the sample meals use (not in the guide's tables)
  ["Chicken Thigh", 6, "oz", 280, 40, 0, 12, "protein"],
  ["Sirloin Steak Strips", 6, "oz", 260, 42, 0, 9, "protein"],
  ["Tuna (canned in water)", 5, "oz", 120, 27, 0, 1, "protein"],
  ["Deli Turkey", 3, "oz", 90, 17, 2, 1, "protein"],
  ["Turkey Sausage", 3, "oz", 150, 16, 2, 9, "protein"],
  ["Pork Tenderloin", 6, "oz", 240, 44, 0, 6, "protein"],
  ["Asparagus", 1, "cup", 30, 3, 5, 0, "vegetable"],
  ["Onions", 0.5, "cup", 30, 1, 7, 0, "vegetable"],
  ["Carrots", 1, "cup", 50, 1, 12, 0, "vegetable"],
  ["Cucumber", 1, "cup", 15, 1, 4, 0, "vegetable"],
  ["Snow Peas", 1, "cup", 40, 3, 7, 0, "vegetable"],
  ["Mixed Vegetables", 1, "cup", 60, 3, 12, 0.5, "vegetable"],
  ["Cheddar Cheese", 1, "oz", 115, 7, 0.5, 9, "fat"],
  ["Whole-Grain Crackers", 6, "crackers", 90, 2, 15, 2, "carb"],
];

// ── 3. Sample meals (the guide's table, sorted by cook type) ─────────
// items: [food name, quantity in servings, role | null (extra)]
type Item = [string, number, MealSlotRole | null];
const MEALS: { name: string; template: string; mealType: MealType; cook: string; items: Item[] }[] = [
  { name: "Buffalo Chicken & Green Beans", template: "low-carb-plate", mealType: "dinner", cook: "Air Fryer", items: [["Chicken Breast", 1, "protein"], ["Green Beans", 1, "filling"], ["Olive Oil", 1, "fat"], ["Buffalo", 1, "flavor"]] },
  { name: "Garlic Lemon Salmon Bowl", template: "plate", mealType: "dinner", cook: "Air Fryer", items: [["Salmon", 1, "protein"], ["Broccoli", 1, "filling"], ["Rice", 1, "carb"], ["Garlic Lemon", 1, "flavor"]] },
  { name: "Soy Garlic Tofu & Cauli Rice", template: "low-carb-plate", mealType: "dinner", cook: "Air Fryer", items: [["Extra-Firm Tofu", 1, "protein"], ["Cauliflower Rice", 1, "filling"], ["Olive Oil", 1, "fat"], ["Soy Garlic", 1, "flavor"]] },
  { name: "Mediterranean Grilled Chicken", template: "low-carb-plate", mealType: "dinner", cook: "Grill", items: [["Chicken Thigh", 1, "protein"], ["Zucchini", 1, "filling"], ["Bell Peppers", 1, null], ["Feta / Parmesan", 1, "fat"], ["Mediterranean", 1, "flavor"]] },
  { name: "Chili Lime Shrimp & Quinoa", template: "plate", mealType: "dinner", cook: "Grill", items: [["Shrimp", 1, "protein"], ["Asparagus", 1, "filling"], ["Quinoa", 1, "carb"], ["Chili Lime", 1, "flavor"]] },
  { name: "Smoky Paprika Beef & Peppers", template: "low-carb-plate", mealType: "dinner", cook: "Grill", items: [["Lean Ground Beef", 1, "protein"], ["Bell Peppers", 1, "filling"], ["Onions", 1, null], ["Olive Oil", 1, "fat"], ["Smoky Paprika", 1, "flavor"]] },
  { name: "Yogurt, Berries & Granola", template: "bowl", mealType: "breakfast", cook: "No-Cook", items: [["Nonfat Greek Yogurt", 1, "protein"], ["Blueberries", 1, "filling"], ["Granola", 1, "carb"], ["Honey & Vanilla", 1, "flavor"]] },
  { name: "Cottage Cheese Banana Oats", template: "bowl", mealType: "breakfast", cook: "No-Cook", items: [["Cottage Cheese", 1, "protein"], ["Banana", 1, "filling"], ["Oats", 1, "carb"], ["Nut Butter", 1, "fat"], ["Cinnamon", 1, "flavor"]] },
  { name: "Dill Yogurt Tuna Slaw", template: "low-carb-plate", mealType: "lunch", cook: "No-Cook", items: [["Tuna (canned in water)", 1, "protein"], ["Cabbage / Slaw", 1, "filling"], ["Cucumber", 1, null], ["Olive Oil", 1, "fat"], ["Greek Yogurt Herb", 1, "flavor"]] },
  { name: "Turkey, Apple & Cheese Plate", template: "plate", mealType: "lunch", cook: "No-Cook", items: [["Deli Turkey", 1, "protein"], ["Apple", 1, "filling"], ["Whole-Grain Crackers", 1, "carb"], ["Cheddar Cheese", 1, "fat"], ["Dijon Herb", 1, "flavor"]] },
  { name: "Mango Oat Yogurt Bowl", template: "bowl", mealType: "breakfast", cook: "No-Cook", items: [["Nonfat Greek Yogurt", 1, "protein"], ["Mango", 1, "filling"], ["Oats", 1, "carb"], ["Curry", 1, "flavor"]] },
  { name: "Garlic Lemon Chicken & Rice", template: "plate", mealType: "dinner", cook: "Sheet Pan", items: [["Chicken Breast", 1, "protein"], ["Broccoli", 1, "filling"], ["Rice", 1, "carb"], ["Garlic Lemon", 1, "flavor"]] },
  { name: "Dijon Salmon & Quinoa", template: "plate", mealType: "dinner", cook: "Sheet Pan", items: [["Salmon", 1, "protein"], ["Green Beans", 1, "filling"], ["Quinoa", 1, "carb"], ["Dijon Herb", 1, "flavor"]] },
  { name: "Southwest Sausage & Potatoes", template: "plate", mealType: "dinner", cook: "Sheet Pan", items: [["Turkey Sausage", 1, "protein"], ["Bell Peppers", 1, "filling"], ["Potatoes", 1, "carb"], ["Southwest", 1, "flavor"]] },
  { name: "Turkey Taco Skillet", template: "training-plate", mealType: "dinner", cook: "Skillet", items: [["Ground Turkey (93–99%)", 1, "protein"], ["Bell Peppers", 1, "filling"], ["Onions", 1, null], ["Rice", 1, "carb"], ["Mexican / Taco", 1, "flavor"]] },
  { name: "Eggs, Spinach & Toast", template: "plate", mealType: "breakfast", cook: "Skillet", items: [["Eggs + Egg Whites", 1, "protein"], ["Spinach", 1, "filling"], ["Bread / Toast", 1, "carb"], ["Garlic Lemon", 1, "flavor"]] },
  { name: "Ginger Beef & Cabbage", template: "low-carb-plate", mealType: "dinner", cook: "Skillet", items: [["Sirloin Steak Strips", 1, "protein"], ["Cabbage / Slaw", 1, "filling"], ["Mushrooms", 1, null], ["Olive Oil", 1, "fat"], ["Asian Ginger", 1, "flavor"]] },
  { name: "BBQ Pork & Potatoes", template: "plate", mealType: "dinner", cook: "Slow Cooker", items: [["Pork Tenderloin", 1, "protein"], ["Carrots", 1, "filling"], ["Onions", 1, null], ["Potatoes", 1, "carb"], ["BBQ (Light)", 1, "flavor"]] },
  { name: "Chicken & Bean Curry", template: "training-plate", mealType: "dinner", cook: "Slow Cooker", items: [["Chicken Breast", 1, "protein"], ["Mixed Vegetables", 1, "filling"], ["Beans / Lentils", 1, "carb"], ["Curry", 1, "flavor"]] },
  { name: "Turkey Taco Chili", template: "training-plate", mealType: "dinner", cook: "Slow Cooker", items: [["Ground Turkey (93–99%)", 1, "protein"], ["Bell Peppers", 1, "filling"], ["Beans / Lentils", 1, "carb"], ["Mexican / Taco", 1, "flavor"]] },
  { name: "Soy Garlic Shrimp Stir-Fry", template: "low-carb-plate", mealType: "dinner", cook: "Stir Fry", items: [["Shrimp", 1, "protein"], ["Snow Peas", 1, "filling"], ["Bell Peppers", 1, null], ["Olive Oil", 1, "fat"], ["Soy Garlic", 1, "flavor"]] },
  { name: "Teriyaki Chicken Stir-Fry", template: "low-carb-plate", mealType: "dinner", cook: "Stir Fry", items: [["Chicken Breast", 1, "protein"], ["Broccoli", 1, "filling"], ["Mushrooms", 1, null], ["Olive Oil", 1, "fat"], ["Teriyaki-Style", 1, "flavor"]] },
  { name: "Ginger Tofu Stir-Fry", template: "low-carb-plate", mealType: "dinner", cook: "Stir Fry", items: [["Extra-Firm Tofu", 1, "protein"], ["Cabbage / Slaw", 1, "filling"], ["Bell Peppers", 1, null], ["Olive Oil", 1, "fat"], ["Asian Ginger", 1, "flavor"]] },
];

async function main() {
  const argv = process.argv.slice(2);
  const user = await resolveSeedUser(prisma, argv);
  console.log(`Seeding meal guide for ${user.email}\n`);

  // 1. Archetypes
  const templateIds = new Map<string, string>();
  for (let i = 0; i < ARCHETYPES.length; i++) {
    const a = ARCHETYPES[i];
    const t = await prisma.mealTemplate.upsert({
      where: { slug: a.slug },
      update: { name: a.name, description: a.description, sortOrder: i },
      create: { slug: a.slug, name: a.name, description: a.description, sortOrder: i },
    });
    await prisma.mealTemplateSlot.deleteMany({ where: { templateId: t.id } });
    await prisma.mealTemplateSlot.createMany({
      data: a.slots.map((s, idx) => ({ templateId: t.id, role: s.role, required: s.required, sortOrder: idx, hint: s.hint })),
    });
    templateIds.set(a.slug, t.id);
  }
  console.log(`✓ ${ARCHETYPES.length} archetypes`);

  // 2. Foods
  const foodIds = new Map<string, string>();
  let foodsCreated = 0;
  for (const [name, servingSize, servingUnit, calories, protein, carbs, fat] of FOODS) {
    const existing = await prisma.foodItem.findFirst({ where: { name, source: "guide", userId: null }, select: { id: true } });
    if (existing) {
      await prisma.foodItem.update({ where: { id: existing.id }, data: { servingSize, servingUnit, calories, protein, carbs, fat } });
      foodIds.set(name, existing.id);
    } else {
      const f = await prisma.foodItem.create({
        data: { name, servingSize, servingUnit, calories, protein, carbs, fat, source: "guide", isCustom: false, userId: null },
        select: { id: true },
      });
      foodIds.set(name, f.id);
      foodsCreated++;
    }
  }
  console.log(`✓ ${FOODS.length} library foods (${foodsCreated} new)`);

  // 3. Sample meals
  let mealsCreated = 0;
  let mealsSkipped = 0;
  for (const m of MEALS) {
    const exists = await prisma.savedMeal.findFirst({ where: { userId: user.id, name: m.name }, select: { id: true } });
    if (exists) {
      mealsSkipped++;
      continue;
    }
    const items = m.items.map(([food, quantity, role], idx) => {
      const foodItemId = foodIds.get(food);
      if (!foodItemId) throw new Error(`Sample meal "${m.name}" references unknown food "${food}"`);
      return { foodItemId, quantity, role, sortOrder: idx };
    });
    await prisma.savedMeal.create({
      data: {
        userId: user.id,
        name: m.name,
        mealType: m.mealType,
        templateId: templateIds.get(m.template) ?? null,
        notes: `${m.cook} · from the meal construction guide`,
        items: { create: items },
      },
    });
    mealsCreated++;
  }
  console.log(`✓ ${MEALS.length} sample meals (${mealsCreated} created, ${mealsSkipped} already present)`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
