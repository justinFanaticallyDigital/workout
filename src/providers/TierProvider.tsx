"use client";

/**
 * TierProvider — UI-simulated tier context (MIGRATION_MAP.md §1.3).
 *
 * No billing/entitlement yet: the tier is a client-side, dev-switchable value
 * persisted to localStorage. It drives the tier-aware BottomNav slot 1, the
 * locked rail slots in PillarShell, and the Lifestyle preview-lock. Locked
 * surfaces preview rather than gate (ARCHITECTURE.md §7).
 *
 * Default is `gameplan` so the currently-built surfaces stay fully visible
 * during the cluster-by-cluster migration; switch down to preview the
 * locked-tier behavior.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Tier } from "@/lib/tier";
import { TIERS } from "@/lib/tier";

const TIER_KEY = "fittrack-tier";
const DEFAULT_TIER: Tier = "gameplan";

interface TierContextType {
  tier: Tier;
  setTier: (t: Tier) => void;
}

const TierContext = createContext<TierContextType | null>(null);

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<Tier>(DEFAULT_TIER);

  useEffect(() => {
    const saved = localStorage.getItem(TIER_KEY);
    if (saved && (TIERS as string[]).includes(saved)) {
      setTierState(saved as Tier);
    }
  }, []);

  const setTier = (t: Tier) => {
    setTierState(t);
    try {
      localStorage.setItem(TIER_KEY, t);
    } catch {
      /* storage unavailable */
    }
  };

  return <TierContext.Provider value={{ tier, setTier }}>{children}</TierContext.Provider>;
}

export function useTier(): TierContextType {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error("useTier must be used within TierProvider");
  return ctx;
}
