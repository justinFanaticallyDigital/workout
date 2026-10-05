import { prisma } from "@/lib/prisma";

/** Shared by the /api/nutrition/plans routes (route files may only export handlers). */
/** A nutrition plan is an ordered list of saved days. */

export const PLAN_INCLUDE = {
  planDays: {
    orderBy: { dayNumber: "asc" as const },
    include: {
      savedDay: {
        include: {
          slots: {
            orderBy: { sortOrder: "asc" as const },
            include: { meal: { include: { items: { orderBy: { sortOrder: "asc" as const }, include: { foodItem: true } } } } },
          },
        },
      },
    },
  },
};

export function normalizeDayIds(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.some((x) => typeof x !== "string")) return null;
  return raw as string[];
}

/** Only the user's own saved days may be placed in a plan. */

export async function filterOwnDays(userId: string, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.savedDay.findMany({ where: { userId, id: { in: ids } }, select: { id: true } });
  const ok = new Set(rows.map((r) => r.id));
  return ids.filter((id) => ok.has(id));
}
