"use client";

/**
 * 2.10 View-as-Gameplan — Cluster 2 (second-highest in-app upsell).
 *
 * Shows what the user's logging would look like under a Gameplan: real logged-
 * workout count as the hook, with a representative (inert) dashboard preview —
 * today card, goal arc, week strip, adherence rings, an engine rec — under a
 * PREVIEW watermark. Sticky CTA routes to the Shelf. Previews, never gates.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Card, Button, Stamp } from "@/components/v2";
import { listSessions } from "@/lib/logger-store";

export const dynamic = "force-dynamic";

export default function ViewAsGameplanPage() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    listSessions().then((s) => live && setCount(s.filter((x) => x.kind === "workout").length));
    return () => {
      live = false;
    };
  }, []);

  const n = count ?? 14;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <div className="flex-1 overflow-y-auto pb-4">
        <Header kind="sub" title="Your Gameplan preview" right={null} onBack={() => router.back()} />

        {/* Banner */}
        <div className="px-4 pb-3">
          <div className="rounded-ft-md border border-ft-accent-border bg-ft-accent-faint px-3.5 py-3">
            <div className="font-body text-[13.5px] font-semibold leading-snug text-ft-white">
              Based on your <span className="text-ft-accent">{n} logged workouts</span>, here&apos;s what a
              Gameplan would look like.
            </div>
            <div className="mt-0.5 font-body text-[11.5px] leading-snug text-ft-light">
              Real data. Inert controls. Tap the CTA to make it real.
            </div>
          </div>
        </div>

        <div className="relative px-4">
          {/* PREVIEW watermark */}
          <div className="pointer-events-none absolute right-3.5 top-3 z-[4] rotate-3 rounded-[3px] border-[1.5px] border-ft-accent bg-ft-surface px-2 py-[3px] font-data text-[9px] font-bold tracking-[0.2em] text-ft-accent opacity-85">
            PREVIEW
          </div>

          <div className="flex flex-col gap-2.5">
            <PreviewTodayCard />
            <GoalArc />
            <WeekStripCard />
            <AdherenceCard />
            <MockRecCard />
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="flex-shrink-0 border-t border-ft-border-faint bg-ft-surface px-4 pb-4 pt-3">
        <Button kind="primary" size="lg" fullWidth onClick={() => router.push("/shelf")}>
          Make this real — start a Gameplan →
        </Button>
        <div className="mt-1.5 text-center font-body text-[11px] text-ft-dim">
          Subscription · $14/mo · cancel anytime
        </div>
      </div>
    </div>
  );
}

function PreviewTodayCard() {
  return (
    <Card className="px-3.5 pb-4 pt-3.5">
      <div className="flex items-start gap-2.5">
        <div className="inline-flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-success-bg font-display text-base font-bold text-ft-success-fg">
          ✓
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Stamp>Yesterday</Stamp>
            <span className="font-data text-[9px] font-bold uppercase tracking-[0.18em] text-ft-success-fg">
              · Logged
            </span>
          </div>
          <div className="mt-1 font-display text-[17px] font-bold leading-tight tracking-[-0.01em] text-ft-white">
            Upper · Push
          </div>
          <div className="mt-0.5 font-body text-[11.5px] leading-snug text-ft-dim">
            Bench 185×5 · OHP 95×8 · Lat raise 20×12 · 52 min
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-ft-border-faint pt-2.5 font-body text-[11.5px] text-ft-light">
        <span className="text-sm text-ft-accent">◇</span>
        <span>If a Gameplan were active, today&apos;s plan would auto-fill here.</span>
      </div>
    </Card>
  );
}

function GoalArc() {
  return (
    <Card className="px-4 pb-4 pt-3.5">
      <Stamp>Goal Arc</Stamp>
      <div className="relative mt-1.5 flex h-[100px] items-center justify-center">
        <svg viewBox="0 0 280 100" width="100%" height="100" className="absolute inset-0">
          <path d="M 20 90 Q 140 0 260 80" fill="none" stroke="rgb(var(--ft-accent))" strokeWidth="2" strokeDasharray="3 5" opacity="0.5" />
          <circle cx="20" cy="90" r="3.5" fill="rgb(var(--ft-border-strong))" />
          <circle cx="260" cy="80" r="5" fill="rgb(var(--ft-accent))" opacity="0.4" />
        </svg>
        <div className="relative z-[2] rounded-full border border-dashed border-ft-border bg-ft-surface px-3 py-1.5">
          <span className="font-body text-[11.5px] font-semibold text-ft-light">Set a goal to see this come alive</span>
        </div>
      </div>
    </Card>
  );
}

function WeekStripCard() {
  const days = [
    { label: "M", logged: true, color: "bg-ft-pull" },
    { label: "T", logged: false, color: "" },
    { label: "W", logged: true, color: "bg-ft-push" },
    { label: "T", logged: true, color: "bg-ft-push" },
    { label: "F", logged: false, color: "" },
    { label: "S", logged: true, color: "bg-ft-pull" },
    { label: "S", logged: false, color: "" },
  ];
  return (
    <Card className="px-3.5 pb-3.5 pt-3">
      <div className="mb-2 flex items-baseline justify-between">
        <Stamp>This week · logged</Stamp>
        <span className="font-data text-[10px] tracking-[0.06em] text-ft-dim">4 / 7 days</span>
      </div>
      <div className="flex gap-1.5">
        {days.map((d, i) => (
          <div
            key={i}
            className={[
              "flex h-14 flex-1 flex-col items-center justify-between rounded-ft-sm py-1.5",
              d.logged ? d.color : "border border-dashed border-ft-border bg-ft-surface-alt",
            ].join(" ")}
          >
            <span
              className={[
                "font-data text-[9px] font-semibold tracking-[0.08em]",
                d.logged ? "text-ft-on-accent" : "text-ft-dim",
              ].join(" ")}
            >
              {d.label}
            </span>
            <span className={d.logged ? "text-[11px] text-ft-on-accent" : "text-[10px] text-ft-dim"}>
              {d.logged ? "✓" : "·"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Ring({ pct, value, label, tone }: { pct: number; value: string; label: string; tone: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(var(--ft-surface-alt))" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={`rgb(var(--ft-${tone}))`}
          strokeWidth="5"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 28 28)"
        />
        <text x="28" y="32" textAnchor="middle" fill="rgb(var(--ft-text-primary))" style={{ fontFamily: "var(--ft-font-data)", fontSize: 13, fontWeight: 700 }}>
          {value}
        </text>
      </svg>
      <div className="text-center font-data text-[9.5px] uppercase tracking-[0.08em] text-ft-dim">{label}</div>
    </div>
  );
}

function AdherenceCard() {
  return (
    <Card className="px-3.5 pb-3.5 pt-3">
      <div className="mb-2">
        <Stamp>Adherence · last 4 weeks</Stamp>
      </div>
      <div className="flex gap-1">
        <Ring pct={71} value="71%" label="Workouts" tone="accent" />
        <Ring pct={83} value="83%" label="Volume" tone="success" />
        <Ring pct={42} value="3d" label="Streak" tone="accent" />
      </div>
    </Card>
  );
}

function MockRecCard() {
  return (
    <Card className="px-3.5 pb-3.5 pt-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ft-accent-faint font-display text-[11px] font-bold text-ft-accent">
          R
        </span>
        <Stamp>Engine recommendation</Stamp>
      </div>
      <div className="font-body text-[13px] leading-snug text-ft-white">
        Your bench has plateaued at 185 × 5.{" "}
        <span className="font-semibold text-ft-accent">Drop to 175 × 8 for a hypertrophy block</span> — you&apos;ll
        hit 195 in ~5 weeks.
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-ft-border-faint pt-2 font-body text-[11.5px] text-ft-dim">
        <span>Based on your last 6 sessions</span>
        <span>Disabled in preview</span>
      </div>
    </Card>
  );
}
