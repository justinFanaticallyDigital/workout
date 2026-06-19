"use client";

/**
 * 3.6 / 4.6 — Progress (Program · Gameplan), v2 reskin of `/progress`.
 *
 * Non-pillar slot-1 surface → renders through HomeShell + the single global
 * BottomNav (ARCHITECTURE.md §3), no rail. Tier-branched via useTier():
 *   • program  → two LOCKED preview cards (check-in · recommendations) — the
 *                Gameplan upsell, never a gate (§7).
 *   • gameplan → the superset: three this-week adherence rings, weekly
 *                check-in history, and the recommendation ledger.
 * Shared base across both: metric trend chart + month adherence calendar +
 * workout history. Data is computed server-side and handed in as props.
 *
 * Charts are restrained inline SVG drawn from real series — no chart library.
 * Chrome on the page bg uses the on-bg tokens (Blueprint-safe).
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeShell, Header, Card, Button, Chip, Stamp, SectionLabel, Segmented } from "@/components/v2";
import { useTier } from "@/providers/TierProvider";

export type MetricKey = "e1rm" | "volume" | "weight";

export interface MetricSeries {
  label: string;
  unit: string;
  up: boolean;
  series: number[];
  delta: string;
}
export type CalStatus = "full" | "rest" | "future" | "none";
export interface HistoryRow {
  id: string;
  date: string;
  name: string;
  stat: string;
  pr: boolean;
}
export interface Ring {
  label: string;
  pct: number;
  sub: string;
}
export interface CheckinRow {
  id: string | null;
  week: string;
  status: "ready" | "applied";
  note: string;
}
export interface RecRow {
  id: string;
  rec: string;
  status: "applied" | "dismissed";
  meta: string;
}
export interface ProgressData {
  metrics: Record<MetricKey, MetricSeries>;
  calendar: CalStatus[][];
  calendarMonth: string;
  history: HistoryRow[];
  loggedCount: number;
  enough: boolean;
  rings: Ring[];
  checkins: CheckinRow[];
  recs: RecRow[];
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

// ── metric trend (line + area) ────────────────────────────────────────────
function MetricChart({ m }: { m: MetricSeries }) {
  const W = 288;
  const H = 132;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 18;
  const vals = m.series.length ? m.series : [0, 0];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = (i: number) => padL + (vals.length === 1 ? innerW / 2 : (i / (vals.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - ((v - min) / span) * innerH;
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${padL},${padT + innerH} ${pts} ${padL + innerW},${padT + innerH}`;
  const last = vals[vals.length - 1];
  return (
    <Card raised className="px-4 py-3.5">
      <div className="flex items-baseline justify-between">
        <div>
          <Stamp>{m.label}</Stamp>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-number text-[28px] font-bold leading-none text-ft-white">{fmt(last)}</span>
            <span className="font-body text-[13px] text-ft-dim">{m.unit}</span>
          </div>
        </div>
        <Chip tone={m.up ? "success" : "accent"} size="sm">
          {m.delta}
        </Chip>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-[132px] w-full overflow-visible">
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={padL}
            x2={padL + innerW}
            y1={padT + g * innerH}
            y2={padT + g * innerH}
            stroke="rgb(var(--ft-border-faint))"
            strokeWidth="1"
          />
        ))}
        <polygon points={area} fill="rgb(var(--ft-accent-faint))" />
        <polyline
          points={pts}
          fill="none"
          stroke="rgb(var(--ft-accent))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {vals.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={i === vals.length - 1 ? 4 : 2.4}
            fill={i === vals.length - 1 ? "rgb(var(--ft-accent))" : "rgb(var(--ft-surface))"}
            stroke="rgb(var(--ft-accent))"
            strokeWidth="1.6"
          />
        ))}
      </svg>
      <div className="mt-0.5 flex justify-between">
        {["8 wk", "6", "4", "2", "Now"].map((l) => (
          <span key={l} className="font-data text-[9.5px] tracking-[0.04em] text-ft-dim">
            {l}
          </span>
        ))}
      </div>
    </Card>
  );
}

// ── adherence calendar ──────────────────────────────────────────────────────
function AdherenceCalendar({ month, data }: { month: string; data: CalStatus[][] }) {
  const bg = (s: CalStatus) =>
    s === "full"
      ? "rgb(var(--ft-accent))"
      : s === "rest"
        ? "rgb(var(--ft-surface-alt))"
        : "transparent";
  const legend: [string, CalStatus][] = [
    ["Trained", "full"],
    ["Rest", "rest"],
  ];
  return (
    <Card className="p-3.5">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="font-body text-[13.5px] font-bold text-ft-white">{month}</span>
        <div className="flex gap-3">
          {legend.map(([l, s]) => (
            <span key={l} className="inline-flex items-center gap-1 font-data text-[9.5px] tracking-[0.03em] text-ft-dim">
              <span className="h-[9px] w-[9px] rounded-ft-sm" style={{ background: bg(s) }} />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-center font-data text-[9px] font-bold tracking-[0.04em] text-ft-dim">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {data.map((wk, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {wk.map((s, di) => (
              <div
                key={di}
                className="aspect-square rounded-ft-sm"
                style={{
                  background: bg(s),
                  border:
                    s === "future"
                      ? "1px dashed rgb(var(--ft-border-faint))"
                      : s === "none"
                        ? "1px solid rgb(var(--ft-border-faint))"
                        : "none",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── workout history list ──────────────────────────────────────────────────
function HistoryList({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="px-1 font-body text-xs text-ft-dim">No sessions logged yet.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      {rows.map((h, i) => (
        <Link
          key={h.id}
          href={`/history/${h.id}`}
          className={["flex items-center gap-3 px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
        >
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "rgb(var(--ft-success-fg))" }} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-body text-[13px] font-semibold text-ft-white">{h.name}</span>
              {h.pr && (
                <Chip tone="accent" size="sm">
                  PR
                </Chip>
              )}
            </div>
            <div className="mt-0.5 font-data text-[10.5px] tracking-[0.03em] text-ft-dim">
              {h.date} · {h.stat}
            </div>
          </div>
          <span className="font-body text-base text-ft-dim">›</span>
        </Link>
      ))}
    </Card>
  );
}

// ── locked preview card (program-tier upsell) ──────────────────────────────
function PreviewCard({
  stamp,
  title,
  lines,
  cta,
  href,
}: {
  stamp: string;
  title: string;
  lines: string[];
  cta: string;
  href: string;
}) {
  return (
    <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
      <div className="flex items-center justify-between">
        <Stamp>{stamp}</Stamp>
        <Chip tone="neutral" size="sm">
          Locked
        </Chip>
      </div>
      <div className="mt-1.5 font-display text-base font-bold tracking-[-0.01em] text-ft-white">{title}</div>
      <div className="mt-2.5 flex flex-col gap-1.5">
        {lines.map((f) => (
          <div key={f} className="flex gap-2 font-body text-[12.5px] text-ft-light">
            <span className="mt-px text-ft-accent">·</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <Link href={href} className="mt-3 block">
        <Button kind="primary" size="md" fullWidth>
          {cta}
        </Button>
      </Link>
    </Card>
  );
}

// ── adherence rings (gameplan superset) ────────────────────────────────────
function RingStat({ pct, label, sub }: Ring) {
  const R = 25;
  const sw = 6;
  const C = 2 * Math.PI * R;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * C;
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="relative h-[66px] w-[66px]">
        <svg viewBox="0 0 66 66" className="block h-[66px] w-[66px] -rotate-90">
          <circle cx="33" cy="33" r={R} fill="none" stroke="rgb(var(--ft-surface-alt))" strokeWidth={sw} />
          <circle
            cx="33"
            cy="33"
            r={R}
            fill="none"
            stroke="rgb(var(--ft-accent))"
            strokeWidth={sw}
            strokeDasharray={`${dash} ${C}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-number text-lg font-bold leading-none text-ft-white">
          {pct}
          <span className="ml-px mt-0.5 self-start text-[9px] text-ft-dim">%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="font-body text-xs font-bold text-ft-white">{label}</div>
        <div className="mt-px font-data text-[10px] tracking-[0.03em] text-ft-dim">{sub}</div>
      </div>
    </div>
  );
}

function Rings({ rings }: { rings: Ring[] }) {
  return (
    <Card className="px-3 py-4">
      <div className="flex gap-1">
        {rings.map((r) => (
          <RingStat key={r.label} {...r} />
        ))}
      </div>
    </Card>
  );
}

// ── weekly check-in history (gameplan superset) ────────────────────────────
function CheckinList({ rows }: { rows: CheckinRow[] }) {
  if (rows.length === 0) {
    return <p className="px-1 font-body text-xs text-ft-dim">No check-ins yet.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      {rows.map((c, i) => {
        const ready = c.status === "ready";
        const inner = (
          <>
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: ready ? "rgb(var(--ft-accent))" : "rgb(var(--ft-success-fg))" }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-body text-[13px] font-semibold text-ft-white">{c.week}</span>
                <Chip tone={ready ? "accent" : "success"} size="sm">
                  {ready ? "Ready" : "Applied"}
                </Chip>
              </div>
              <div className="mt-0.5 font-data text-[10.5px] tracking-[0.03em] text-ft-dim">{c.note}</div>
            </div>
            {ready ? (
              <Button kind="primary" size="sm">
                Start
              </Button>
            ) : (
              <span className="font-body text-base text-ft-dim">›</span>
            )}
          </>
        );
        const cls = ["flex items-center gap-3 px-3.5 py-3", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ");
        return ready ? (
          <Link key={i} href="/checkin" className={cls}>
            {inner}
          </Link>
        ) : (
          <Link key={i} href="/progress/check-ins" className={cls}>
            {inner}
          </Link>
        );
      })}
    </Card>
  );
}

// ── recommendation ledger (gameplan superset) ──────────────────────────────
function RecLedger({ rows }: { rows: RecRow[] }) {
  if (rows.length === 0) {
    return <p className="px-1 font-body text-xs text-ft-dim">No recommendations yet.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      {rows.map((r, i) => {
        const applied = r.status === "applied";
        return (
          <div
            key={r.id}
            className={["flex items-center gap-3 px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <div className={["font-body text-[13px] font-semibold", applied ? "text-ft-white" : "text-ft-light"].join(" ")}>
                {r.rec}
              </div>
              <div className="mt-0.5 font-data text-[10.5px] tracking-[0.03em] text-ft-dim">{r.meta}</div>
            </div>
            <Chip tone={applied ? "success" : "neutral"} size="sm">
              {applied ? "Applied" : "Dismissed"}
            </Chip>
          </div>
        );
      })}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════
export default function ProgressView(data: ProgressData) {
  const router = useRouter();
  const { tier } = useTier();
  const gameplan = tier === "gameplan";
  const [metric, setMetric] = useState<MetricKey>("e1rm");

  const metricOpts: { value: MetricKey; label: string }[] = [
    { value: "e1rm", label: "e1RM" },
    { value: "volume", label: "Volume" },
    { value: "weight", label: "Weight" },
  ];

  return (
    <HomeShell
      header={
        <Header
          kind="home"
          title="Progress"
          subtitle={gameplan ? "Gameplan" : "Program"}
          right="gear"
          onGear={() => router.push("/settings")}
        />
      }
    >
      {!data.enough ? (
        <div className="px-4 pt-3">
          <Card className="px-5 py-7 text-center">
            <div
              className="mx-auto mb-3.5 inline-flex h-[72px] w-[72px] items-center justify-center rounded-ft-lg border border-dashed border-ft-border text-[26px] text-ft-dim"
              style={{ background: "rgb(var(--ft-surface-alt))" }}
            >
              📈
            </div>
            <div className="font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Not enough data yet</div>
            <div className="mt-1.5 font-body text-[12.5px] leading-snug text-ft-dim">
              Trends unlock after a couple weeks of logged sessions. {data.loggedCount} of 6 logged.
            </div>
          </Card>
          <SectionLabel right={`${data.history.length} logged`}>Recent</SectionLabel>
          <div className="px-4">
            <HistoryList rows={data.history} />
          </div>
          <SectionLabel>Adherence</SectionLabel>
          <div className="px-4 pb-2">
            <AdherenceCalendar month={data.calendarMonth} data={data.calendar} />
          </div>
        </div>
      ) : (
        <div className="px-4 pt-3">
          {/* metric trend — shared base */}
          <Segmented value={metric} onChange={setMetric} options={metricOpts} />
          <div className="mt-3">
            <MetricChart m={data.metrics[metric]} />
          </div>

          {gameplan ? (
            <>
              <SectionLabel right="This week">Adherence</SectionLabel>
              <Rings rings={data.rings} />
              <div className="mt-2.5">
                <AdherenceCalendar month={data.calendarMonth} data={data.calendar} />
              </div>

              <SectionLabel right="History →">Weekly check-ins</SectionLabel>
              <CheckinList rows={data.checkins} />

              <SectionLabel right="See feed →">Recommendations</SectionLabel>
              <RecLedger rows={data.recs} />
            </>
          ) : (
            <>
              <SectionLabel right="This month">Adherence</SectionLabel>
              <AdherenceCalendar month={data.calendarMonth} data={data.calendar} />

              <SectionLabel>With Gameplan</SectionLabel>
              <div className="flex flex-col gap-2.5">
                <PreviewCard
                  stamp="Weekly check-in"
                  title="Weekly check-in"
                  lines={["Confirm weight, energy, soreness weekly", "Engine tunes loads + macros from it"]}
                  cta="See Gameplan →"
                  href="/shelf"
                />
                <PreviewCard
                  stamp="Recommendations"
                  title="Recommendation feed"
                  lines={["Engine flags changes as you train", "Accept or dismiss, one tap each"]}
                  cta="Compare tiers →"
                  href="/shelf/compare"
                />
              </div>
            </>
          )}

          <SectionLabel right="Calendar →">Workout history</SectionLabel>
          <HistoryList rows={data.history} />
        </div>
      )}
    </HomeShell>
  );
}
