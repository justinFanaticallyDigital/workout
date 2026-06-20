# Nutrition Pillar — Admin Data Reference (current state)

> What an admin must provide to make **Build-a-Meal**, **Recipe Detail**, and
> **Grocery List** functional against the schema **as it exists today**. This is
> deliberately scoped to the current models — no schema changes. We will likely
> revise the model later (see "Limitations" + "Clean-model revision").

## 1. What the system actually has today

There is **no `Recipe` model, no `GroceryList` model, and no spreadsheet
importer** (admin authoring / Cluster 7 is deferred). Everything nutrition is
built from two layers:

```
FoodItem                         ← the atom: a food/ingredient + macros per serving
  └─ MealPlan                    ← a named plan (calorie target, macro %, N days)
       └─ MealPlanDay            ← day 1..N (dayNumber only — no name)
            └─ MealPlanMeal      ← breakfast | lunch | dinner | snack (mealType only — no name)
                 └─ MealPlanItem ← a FoodItem + quantity (× servingSize)
```

The daily diary is the parallel `Meal → MealItem → FoodItem` chain. Macro
targets are a separate `NutritionTarget` row (calories/protein/carbs/fat).

**Field inventory (the columns that exist):**

`FoodItem`: `name`, `brand?`, `barcode?`, `servingSize` (default 100),
`servingUnit` (default "g"), `calories`, `protein`, `carbs`, `fat`, `fiber?`,
`sugar?`, `sodium?`, `source` (custom/usda/openfoodfacts).

`MealPlan`: `name`, `days`, `calorieTarget?`, `proteinPct?`, `carbsPct?`,
`fatPct?`, `mealsPerDay`, `preferences?`.
`MealPlanDay`: `dayNumber`. `MealPlanMeal`: `mealType`, `sortOrder`.
`MealPlanItem`: `foodItemId`, `quantity`, `sortOrder`.

## 2. How the three features map onto current models

| Design feature | Backed today by | Functional now? |
|---|---|---|
| **Build-a-Meal** | A `MealPlanMeal` composed of `MealPlanItem`s (food + quantity). The plan generator already builds these from macro %s; per-meal macro totals are summed client-side from each item's `FoodItem` × quantity. | **Data structure: yes.** Interactive shuffle/lock/re-roll wizard: not built (UI only). |
| **Recipe Detail** | Either (a) a single named `FoodItem` = a composite dish with bundled macros (no ingredient breakdown), or (b) a `MealPlanMeal` = a group of ingredient `FoodItem`s (breakdown, but no recipe name/steps and it lives inside a plan/day). | **Approximated only** — see Limitations. |
| **Grocery List** | Pure aggregation: sum every `MealPlanItem.quantity × FoodItem.servingSize` (grouped by `FoodItem.name`/`servingUnit`) across the plan's days. | **Computable now** from existing data — nothing extra to author beyond real serving sizes. No model needed. |

## 3. The spreadsheet you'd provide

To populate the current models, supply **two sheets**. Grocery List needs **no
sheet** — it is derived from Sheet 2 + Sheet 1 serving sizes.

### Sheet 1 — `Foods` (one row per ingredient/food → one `FoodItem`)

| Column | Maps to | Required | Notes |
|---|---|---|---|
| `name` | FoodItem.name | ✅ | Unique-enough to match from Sheet 2 (e.g. "Chicken breast, raw") |
| `brand` | FoodItem.brand | — | |
| `barcode` | FoodItem.barcode | — | Enables barcode lookup in the diary |
| `serving_size` | FoodItem.servingSize | ✅ | The numeric base the macros are stated for (e.g. 100) |
| `serving_unit` | FoodItem.servingUnit | ✅ | **Drives the grocery math** — keep consistent (g / ml / each) |
| `calories` | FoodItem.calories | ✅ | Per `serving_size` |
| `protein` | FoodItem.protein | ✅ | grams, per serving |
| `carbs` | FoodItem.carbs | ✅ | grams, per serving |
| `fat` | FoodItem.fat | ✅ | grams, per serving |
| `fiber` / `sugar` / `sodium` | FoodItem.fiber/sugar/sodium | — | optional |
| `source` | FoodItem.source | — | default "custom" |

### Sheet 2 — `MealPlans` (one row per **item**; the hierarchy is implied by repeated keys)

| Column | Maps to | Required | Notes |
|---|---|---|---|
| `plan_name` | MealPlan.name | ✅ | Groups rows into one plan |
| `plan_days` | MealPlan.days | — | default 7 |
| `calorie_target` | MealPlan.calorieTarget | — | the plan's daily kcal |
| `protein_pct` / `carbs_pct` / `fat_pct` | MealPlan macro split | — | |
| `day_number` | MealPlanDay.dayNumber | ✅ | 1..N |
| `meal_type` | MealPlanMeal.mealType | ✅ | **must be** breakfast / lunch / dinner / snack |
| `meal_sort` | MealPlanMeal.sortOrder | — | order within the day |
| `food_name` | → match to Sheet 1 `name` → MealPlanItem.foodItemId | ✅ | the ingredient line |
| `quantity` | MealPlanItem.quantity | ✅ | multiplier of the food's `serving_size` |
| `item_sort` | MealPlanItem.sortOrder | — | order within the meal |

**Worked row set (one breakfast):**

```
plan_name      day_number  meal_type   food_name              quantity
High-Protein   1           breakfast   Egg, whole, large      3
High-Protein   1           breakfast   Oats, dry              0.8
High-Protein   1           breakfast   Blueberries            1.5
```

From that, the app can: render the meal (Build-a-Meal), show its macro total
(sum of each food × quantity × serving), and roll the whole plan up into a
grocery list (e.g. `Oats 0.8 + 0.8 + … = N × 100 g`).

## 4. Limitations of the current model (the honest gaps)

These are why "Recipe Detail" and a clean "Grocery List" are *approximations*
today, not native:

1. **No recipe name / steps.** `MealPlanMeal` and `MealPlanDay` store only
   `mealType` / `dayNumber` — **no `name`, no `notes`, no instructions field.**
   A recipe's *title* and *method* have nowhere to live unless you encode the
   recipe as a single `FoodItem` (which then loses its ingredient breakdown).
2. **A FoodItem is a flat macro bundle** — it has no child ingredients. So you
   pick ONE representation per recipe: named-dish-as-FoodItem (no breakdown) OR
   ingredients-as-MealPlanItems (no title/steps).
3. **Grocery List is computed, never stored** — fine, but quantities are only
   meaningful if every `serving_unit` is consistent and real (don't mix "g" and
   "each" for the same food across rows).
4. **No importer exists.** Today this spreadsheet would be loaded via a one-off
   seed script (like `scripts/seed-program-templates.ts`), not an admin upload
   screen — the admin upload/parse flow (Cluster 7) is deferred.

## 5. Clean-model revision (later, when we revise)

To store recipes/grocery natively rather than approximating, the minimal adds:
- `Recipe` model (name, steps/notes, servings, optional hero image) with
  `RecipeIngredient` rows (FoodItem + quantity) — gives title + breakdown in one.
- `name` + `notes` on `MealPlanMeal` (so a plan slot can *be* a recipe by ref).
- Optional `GroceryList` snapshot table if we want editable/checkable lists
  rather than always-derived ones.

Until then: **Sheet 1 (Foods) + Sheet 2 (MealPlans)** is the complete input set
that makes Build-a-Meal and a derived Grocery List functional, and Recipe Detail
functional in its approximated form.
