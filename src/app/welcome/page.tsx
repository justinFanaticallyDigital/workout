"use client";

/**
 * 1.5 — Tier landing · /welcome (Cluster 1). Presents the three ways to use
 * FitTrack and sets the (UI-simulated) tier, routing to that tier's slot-1
 * home. Doubles as the tier comparison. Full-screen; the global BottomNav is
 * hidden here. Everything-reversible framing per the flow rules (§7).
 */
import { useRouter } from "next/navigation";
import { Card, Button, Chip, Stamp } from "@/components/v2";
import { useTier } from "@/providers/TierProvider";
import { tierHome, type Tier } from "@/lib/tier";

interface TierDef {
  tier: Tier;
  name: string;
  sub: string;
  headline: string;
  bullets: string[];
  cta: string;
  recommended?: boolean;
}

const TIER_DEFS: TierDef[] = [
  {
    tier: "logger",
    name: "Logger",
    sub: "Free forever",
    headline: "Track your workouts. You own your data.",
    bullets: ["Unlimited logging", "All 7 themes", "Local + CSV export"],
    cta: "Start as Logger",
  },
  {
    tier: "program",
    name: "Program",
    sub: "One-time",
    headline: "Pick a plan. Run it on your own. Keep it forever.",
    bullets: ["Pre-built multi-week programs", "Planning Mode — swap, skip, edit", "Meal & lifestyle templates"],
    cta: "Browse Programs",
    recommended: true,
  },
  {
    tier: "gameplan",
    name: "Gameplan",
    sub: "Subscription",
    headline: "Get coached. The app adapts your plan each week.",
    bullets: ["Weekly check-ins", "Adaptive deloads & refeeds", "Recommendations you can apply"],
    cta: "Browse Gameplans",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { setTier } = useTier();

  const choose = (t: Tier) => {
    setTier(t);
    router.push(t === "logger" ? tierHome(t).href : "/shelf");
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <div className="ft-on-bg flex-shrink-0 px-5 pb-3 pt-6">
        <Stamp>FitTrack · onboarding</Stamp>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-[-0.015em] text-ft-on-bg">
          Where do you want to start?
        </h1>
        <p className="mt-2 max-w-sm font-body text-[13px] leading-relaxed text-ft-on-bg-sec">
          Three ways to use FitTrack. Pick what fits today — move between them whenever you&apos;re ready.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-3">
          {TIER_DEFS.map((d) => (
            <Card
              key={d.tier}
              raised={d.recommended}
              className="px-4 py-4"
              style={d.recommended ? { borderColor: "rgb(var(--ft-accent-border))" } : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stamp>{d.name}</Stamp>
                  <span className="font-data text-[10px] uppercase tracking-[0.08em] text-ft-dim">{d.sub}</span>
                </div>
                {d.recommended && (
                  <Chip tone="accent" size="sm">
                    Popular
                  </Chip>
                )}
              </div>
              <div className="mt-1.5 font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-ft-white">
                {d.headline}
              </div>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {d.bullets.map((b) => (
                  <div key={b} className="flex items-start gap-2 font-body text-[12.5px] text-ft-light">
                    <span className="mt-px text-ft-accent">·</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Button kind={d.recommended ? "primary" : "secondary"} size="md" fullWidth className="mt-3.5" onClick={() => choose(d.tier)}>
                {d.cta} →
              </Button>
            </Card>
          ))}
        </div>

        <p className="ft-on-bg mt-4 text-center font-data text-[10px] uppercase tracking-[0.08em] text-ft-on-bg-ter">
          What you buy, you keep · what you subscribe to, you keep while you pay
        </p>
      </div>
    </div>
  );
}
