"use client";

/**
 * 5.5a — Post-purchase welcome · /welcome/[type]/[id] (Option A).
 *
 * Shown right after a plan is activated (cloned). Sets the UI-simulated tier
 * to reflect what was activated (program | gameplan), then routes into that
 * tier's home with a couple of first actions. Retention-critical first
 * impression; reversible framing (everything editable in Planning Mode).
 * Full-screen; nav hidden.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button, Stamp } from "@/components/v2";
import { useTier } from "@/providers/TierProvider";
import { tierHome, type Tier } from "@/lib/tier";

export default function PostPurchaseWelcome({ params }: { params: { type: string; id: string } }) {
  const router = useRouter();
  const { setTier } = useTier();
  const tier: Tier = params.type === "program" ? "program" : "gameplan";
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    // Activating sets the tier (simulated) so the rest of the app unlocks.
    setTier(tier);
    fetch(`/api/programs/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => setName(p?.name ?? null))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const home = tierHome(tier);
  const isGameplan = tier === "gameplan";

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ft-bg px-5">
      <div className="ft-on-bg mb-1 text-center">
        <Stamp>{isGameplan ? "Gameplan active" : "Program active"}</Stamp>
      </div>
      <h1 className="ft-on-bg mb-1 text-center font-display text-3xl font-bold tracking-[-0.015em] text-ft-on-bg">
        You&apos;re in.
      </h1>
      <p className="ft-on-bg mb-5 max-w-xs text-center font-body text-[13px] leading-relaxed text-ft-on-bg-sec">
        {name ? `${name} is set up and ready.` : "Your plan is set up and ready."} Everything is editable in Planning Mode.
      </p>

      <Card className="w-full max-w-sm px-4 py-4">
        <div className="flex flex-col gap-2">
          {[
            { label: "Today's session", sub: "Jump into your first workout", href: home.href },
            ...(isGameplan
              ? [{ label: "Weekly check-in", sub: "Tune the plan as you go", href: "/checkin" }]
              : []),
            { label: "Edit the plan", sub: "Planning Mode — swap, skip, adjust", href: `/programs/${params.id}/planning` },
          ].map((row) => (
            <Link key={row.label} href={row.href}>
              <div className="flex items-center justify-between rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5 py-3">
                <div className="min-w-0">
                  <div className="font-body text-[13px] font-semibold text-ft-white">{row.label}</div>
                  <div className="mt-px font-body text-[11.5px] text-ft-dim">{row.sub}</div>
                </div>
                <span className="font-body text-base text-ft-dim">›</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Link href={home.href} className="mt-4 w-full max-w-sm">
        <Button kind="primary" size="lg" fullWidth onClick={() => router.push(home.href)}>
          Go to {home.label} →
        </Button>
      </Link>
    </div>
  );
}
