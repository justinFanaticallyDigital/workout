/**
 * Tier model (MIGRATION_MAP.md §1.3) — the gating axis over the whole app.
 *
 *   logger   — free; manual one-session-at-a-time; LOCAL storage only
 *   program  — one-time purchase; pre-built forward plan; cloud DB
 *   gameplan — subscription; adaptive plan + check-ins + engine; cloud DB
 *
 * For now the tier is UI-simulated (no billing/entitlement). Locked surfaces
 * PREVIEW, never gate (ARCHITECTURE.md §7). `tier` only changes which slot-1
 * home renders, which rail slots are locked, and the Lifestyle preview-lock.
 */
export type Tier = "logger" | "program" | "gameplan";

export const TIERS: Tier[] = ["logger", "program", "gameplan"];

export const TIER_RANK: Record<Tier, number> = {
  logger: 0,
  program: 1,
  gameplan: 2,
};

/** True when `tier` includes everything `needed` unlocks. */
export function tierMeets(tier: Tier, needed: Tier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[needed];
}

/** Bottom-nav slot-1 label + home route, per active tier (MIGRATION_MAP §1.1). */
export function tierHome(tier: Tier): { label: string; href: string } {
  switch (tier) {
    case "program":
      return { label: "Program", href: "/my-program" };
    case "gameplan":
      return { label: "Gameplan", href: "/gameplan" };
    case "logger":
    default:
      return { label: "Workouts", href: "/library" };
  }
}

export const TIER_LABEL: Record<Tier, string> = {
  logger: "Logger",
  program: "Program",
  gameplan: "Gameplan",
};
