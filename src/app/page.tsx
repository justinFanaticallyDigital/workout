"use client";

/**
 * Root entry. Routes to the active tier's slot-1 home (MIGRATION_MAP §1.1)
 * instead of a hard-coded /gameplan — Logger → /library, Program → /my-program,
 * Gameplan → /gameplan.
 *
 * Reads the persisted tier from localStorage directly (same key as
 * TierProvider) rather than the context value, so the redirect doesn't race
 * the provider's async hydration and bounce a saved Logger/Program user to the
 * default /gameplan. A fresh user (no saved tier) defaults to Gameplan and
 * lands on its empty state, which routes into /welcome (tier landing).
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tierHome, TIERS, type Tier } from "@/lib/tier";

const TIER_KEY = "fittrack-tier";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    let tier: Tier = "gameplan";
    try {
      const saved = localStorage.getItem(TIER_KEY);
      if (saved && (TIERS as string[]).includes(saved)) tier = saved as Tier;
    } catch {
      /* storage unavailable — fall back to gameplan */
    }
    router.replace(tierHome(tier).href);
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-body text-sm text-ft-dim">Loading…</p>
    </div>
  );
}
