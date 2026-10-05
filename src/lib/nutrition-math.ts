/**
 * Nutrition math — pure, browser-safe. One place for kcal/macro arithmetic so
 * cards, builders and APIs agree.
 *
 *   item  = food per-serving values × quantity (quantity is in servings)
 *   meal  = Σ items
 *   day   = Σ slot meals
 *   targets for a day = the day's override ?? the default NutritionTarget
 */

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const ZERO_MACROS: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/** Prisma Decimal | number | string | null → number. */
export function num(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "object" && v !== null && "toNumber" in v && typeof (v as { toNumber: unknown }).toNumber === "function") {
    return (v as { toNumber: () => number }).toNumber();
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export interface FoodLike {
  calories: unknown;
  protein: unknown;
  carbs: unknown;
  fat: unknown;
}

export function foodMacros(food: FoodLike, quantity: unknown = 1): Macros {
  const q = num(quantity);
  return {
    calories: num(food.calories) * q,
    protein: num(food.protein) * q,
    carbs: num(food.carbs) * q,
    fat: num(food.fat) * q,
  };
}

export function addMacros(a: Macros, b: Macros): Macros {
  return { calories: a.calories + b.calories, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(addMacros, ZERO_MACROS);
}

export interface ItemLike {
  quantity: unknown;
  foodItem: FoodLike;
}

export function mealMacros(items: ItemLike[]): Macros {
  return sumMacros(items.map((it) => foodMacros(it.foodItem, it.quantity)));
}

export interface SlotLike {
  meal?: { items: ItemLike[] } | null;
}

export function dayMacros(slots: SlotLike[]): Macros {
  return sumMacros(slots.map((s) => (s.meal ? mealMacros(s.meal.items) : ZERO_MACROS)));
}

export function roundMacros(m: Macros): Macros {
  return { calories: Math.round(m.calories), protein: Math.round(m.protein), carbs: Math.round(m.carbs), fat: Math.round(m.fat) };
}

/** "2,400" */
export function fmtKcal(n: unknown): string {
  return Math.round(num(n)).toLocaleString("en-US");
}

const FRACTIONS: [number, string][] = [
  [0.25, "¼"],
  [0.333, "⅓"],
  [0.5, "½"],
  [0.667, "⅔"],
  [0.75, "¾"],
];

/** Pretty quantity: 0.5 → "½", 1.5 → "1½", 2 → "2". */
export function fmtQty(q: unknown): string {
  const n = num(q);
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.05) return String(whole);
  for (const [f, glyph] of FRACTIONS) {
    if (Math.abs(frac - f) < 0.06) return whole ? `${whole}${glyph}` : glyph;
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

export interface ServingLike {
  servingSize: unknown;
  servingUnit: string;
}

/** Portion for an item: "3 whole", "80 g", "6 oz", "½ cup dry". */
export function portionLabel(food: ServingLike, quantity: unknown): string {
  const size = num(food.servingSize);
  const q = num(quantity);
  const unit = food.servingUnit || "";
  const countUnits = ["whole", "each", "piece", "pieces", "slice", "slices", "large", "medium", "small", "serving", "servings", "egg", "eggs", "link", "links", "can", "scoop"];
  if (countUnits.includes(unit.toLowerCase())) return `${fmtQty(size * q)} ${unit}`.trim();
  const amount = size * q;
  if (unit === "g" || unit === "ml") return `${Math.round(amount)} ${unit}`;
  return `${fmtQty(amount)} ${unit}`.trim();
}
