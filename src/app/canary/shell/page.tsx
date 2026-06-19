"use client";

/**
 * /canary/shell — throwaway harness for the v2 shells (PillarShell + rail/chip
 * + tier-aware BottomNav + collapsing header). NOT a product screen; delete
 * once Cluster 2 lands.
 *
 * Verify:
 *   • Rail ↔ Chip (Hide button drops to chip; tapping the chip restores it).
 *   • Tier switch — logger locks Block/Model/Gameplan rail slots + Lifestyle
 *     nav slot (dimmed + lock badge, never hidden).
 *   • Header collapses on scroll.
 *   • Renders correctly in lab + blueprint (canary) + a dark theme.
 */
import { useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useTier } from "@/providers/TierProvider";
import { themeList } from "@/themes";
import { TIERS } from "@/lib/tier";
import { PillarShell, Header, Card, SectionLabel, Chip } from "@/components/v2";
import type { Pillar, RailKey } from "@/components/v2";

export default function ShellCanaryPage() {
  const { themeId, setTheme } = useTheme();
  const { tier, setTier } = useTier();
  const [pillar, setPillar] = useState<Pillar>("training");
  const [activeKey, setActiveKey] = useState<RailKey>("today");

  return (
    <PillarShell
      pillar={pillar}
      activeKey={activeKey}
      onSelectRail={setActiveKey}
      header={<Header kind="home" title="Shell canary" subtitle={`${pillar} · ${tier}`} right="gear" />}
    >
      <div className="space-y-1 px-4 pt-3">
        {/* Theme cycler */}
        <SectionLabel>Theme</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {themeList.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={[
                "rounded-ft-md border px-2.5 py-1 font-body text-[11px] font-semibold",
                themeId === t.id
                  ? "border-ft-accent text-ft-accent bg-ft-accent-faint"
                  : "border-ft-border-faint text-ft-light",
              ].join(" ")}
            >
              {t.name}
            </button>
          ))}
        </div>

        <SectionLabel>Tier (locks rail + Lifestyle nav slot)</SectionLabel>
        <div className="flex gap-1.5">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={[
                "flex-1 rounded-ft-md border px-2.5 py-1.5 font-body text-xs font-semibold capitalize",
                tier === t
                  ? "border-ft-accent text-ft-accent bg-ft-accent-faint"
                  : "border-ft-border-faint text-ft-light",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        <SectionLabel>Pillar (BottomNav active slot)</SectionLabel>
        <div className="flex gap-1.5">
          {(["training", "nutrition", "lifestyle"] as Pillar[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPillar(p)}
              className={[
                "flex-1 rounded-ft-md border px-2.5 py-1.5 font-body text-xs font-semibold capitalize",
                pillar === p
                  ? "border-ft-accent text-ft-accent bg-ft-accent-faint"
                  : "border-ft-border-faint text-ft-light",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>

        <SectionLabel right="scroll to collapse the header">Filler</SectionLabel>
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="mb-2 p-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ft-white">Card {i + 1}</span>
              <Chip tone={i % 2 ? "accent" : "neutral"}>row</Chip>
            </div>
            <p className="mt-1 font-body text-xs text-ft-dim">
              Active rail slot: <span className="text-ft-light">{activeKey}</span>
            </p>
          </Card>
        ))}
      </div>
    </PillarShell>
  );
}
