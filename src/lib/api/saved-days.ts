
/** Shared by the /api/nutrition/saved-days routes (route files may only export handlers). */
export const SAVED_DAY_INCLUDE = {
  slots: {
    orderBy: { sortOrder: "asc" as const },
    include: { meal: { include: { items: { orderBy: { sortOrder: "asc" as const }, include: { foodItem: true } } } } },
  },
  planDays: { select: { plan: { select: { id: true, name: true } } } },
};

export interface SlotInput {
  label: string | null;
  mealId: string | null;
}

export function normalizeSlots(raw: unknown): SlotInput[] | null {
  if (!Array.isArray(raw)) return null;
  const out: SlotInput[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") return null;
    const { label, mealId } = r as { label?: unknown; mealId?: unknown };
    if (mealId != null && typeof mealId !== "string") return null;
    out.push({ label: label ? String(label).trim() : null, mealId: (mealId as string | null | undefined) ?? null });
  }
  return out;
}

function decimalOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Target override fields; all-null means "use the default targets". */

export function overrideData(body: Record<string, unknown>) {
  const out: Record<string, number | null> = {};
  for (const k of ["calories", "protein", "carbs", "fat"] as const) {
    if (body[k] !== undefined) out[k] = decimalOrNull(body[k]);
  }
  return out;
}
