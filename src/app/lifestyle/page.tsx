"use client";

/**
 * 2.9 Lifestyle pillar (Logger preview) — Cluster 2.
 *
 * The whole Lifestyle pillar is a Gameplan-tier surface, so on the Logger tier
 * every rail slot is locked and the content is a faded preview + one factual
 * upsell card. It PREVIEWS, never gates (ARCHITECTURE §7) — the highest-impact
 * in-app upsell. Program/Gameplan tiers get the real pillar in Clusters 3–4;
 * until then they render a short placeholder so the route stays valid.
 */
import { useTier } from "@/providers/TierProvider";
import { PillarShell, Header, Card, Chip, Stamp, Button } from "@/components/v2";
import { railItemsForTier } from "@/components/v2";
import Link from "next/link";
import ProgramLifestyleTab from "./_program";

const PREVIEW = [
  { label: "Sleep", value: "7h 20m", color: "bg-ft-push" },
  { label: "Energy", value: "Good", color: "bg-ft-core" },
  { label: "Soreness", value: "Low", color: "bg-ft-legs" },
  { label: "Steps", value: "8,240", color: "bg-ft-pull" },
];

const FEATURES = [
  "Sleep, energy, soreness, mood logs",
  "Daily readiness from your data",
  "Feeds the weekly check-in engine",
];

export default function LifestylePillarPage() {
  const { tier } = useTier();

  // Program/Gameplan tiers get the real Lifestyle pillar (rail layers + logs).
  if (tier !== "logger") {
    return <ProgramLifestyleTab />;
  }

  // Logger tier — whole pillar locked; preview + upsell.
  const lockedItems = railItemsForTier("lifestyle", "logger", "today").map((i) => ({
    ...i,
    locked: true,
    active: false,
  }));

  return (
    <PillarShell
      pillar="lifestyle"
      activeKey="today"
      items={lockedItems}
      header={<Header kind="home" title="Lifestyle" subtitle="Logger · preview" right="gear" />}
    >
      {/* faded preview of the locked surface */}
      <div className="pointer-events-none px-4 pt-2 opacity-50">
        <div className="grid grid-cols-2 gap-2.5">
          {PREVIEW.map((m) => (
            <Card key={m.label} className="px-3.5 py-3">
              <div className="flex items-center gap-1.5">
                <span className={["h-2 w-2 rounded-sm", m.color].join(" ")} />
                <span className="font-data text-[10px] uppercase tracking-[0.05em] text-ft-dim">{m.label}</span>
              </div>
              <div className="mt-1.5 font-number text-xl font-bold text-ft-white">{m.value}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* factual upsell */}
      <div className="px-4 pt-4">
        <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
          <div className="flex items-center justify-between">
            <Stamp>Gameplan pillar</Stamp>
            <Chip tone="neutral" size="sm">
              Locked
            </Chip>
          </div>
          <div className="mt-1.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">
            Lifestyle tracking
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-2 font-body text-[12.5px] text-ft-light">
                <span className="mt-px text-ft-accent">·</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex gap-2">
            <Link href="/shelf" className="flex-1">
              <Button kind="primary" size="md" fullWidth>
                See Gameplan →
              </Button>
            </Link>
            <Link href="/shelf/compare">
              <Button kind="secondary" size="md">
                Compare
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PillarShell>
  );
}
