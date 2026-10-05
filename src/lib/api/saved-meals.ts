import type { MealSlotRole, MealType } from "@/generated/prisma/enums";

/** Shared by the /api/nutrition/saved-meals routes (route files may only export handlers). */
export const SAVED_MEAL_INCLUDE = {
  items: { orderBy: { sortOrder: "asc" as const }, include: { foodItem: true } },
  template: { include: { slots: { orderBy: { sortOrder: "asc" as const } } } },
  _count: { select: { daySlots: true } },
};

const ROLES = new Set<string>(["protein", "carb", "fat", "filling", "flavor"]);

const MEAL_TYPES = new Set<string>(["breakfast", "lunch", "dinner", "snack"]);

export interface SavedMealItemInput {
  foodItemId: string;
  quantity: number;
  role: MealSlotRole | null;
}

export function normalizeItems(raw: unknown): SavedMealItemInput[] | null {
  if (!Array.isArray(raw)) return null;
  const out: SavedMealItemInput[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") return null;
    const { foodItemId, quantity, role } = r as { foodItemId?: unknown; quantity?: unknown; role?: unknown };
    if (typeof foodItemId !== "string") return null;
    const q = Number(quantity ?? 1);
    if (!Number.isFinite(q) || q <= 0) return null;
    if (role != null && !ROLES.has(String(role))) return null;
    out.push({ foodItemId, quantity: q, role: (role as MealSlotRole | null | undefined) ?? null });
  }
  return out;
}

export function normalizeMealType(raw: unknown): MealType | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === "") return null;
  return MEAL_TYPES.has(String(raw)) ? (String(raw) as MealType) : undefined;
}
