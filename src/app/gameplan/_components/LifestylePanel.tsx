"use client";

import Link from "next/link";
import { SectionH } from "./SectionH";
import { Archivo } from "./typography";
import { EditPlanBtn } from "./EditPlanBtn";
import { SleepCard } from "./SleepCard";
import { StressCard } from "./StressCard";
import { ProteinHitCard } from "./ProteinHitCard";
import type {
  CheckIn,
  StretchRoutine,
  DailyMetricLite,
  LifestyleTargetLite,
  LifestyleLogLite,
  DailyProteinPoint,
} from "./types";

interface Props {
  stretchRoutine: StretchRoutine | null;
  recentCheckIns: CheckIn[];
  /** Active program for goal-pulse start date + EditPlanBtn target. */
  programId: string | null;
  programStartDate: string | null;
  programDurationWeeks: number | null;
  /** R6 — fed from /api/integrations/fitbit/daily; SleepCard + StressCard read. */
  dailyMetrics: DailyMetricLite[];
  /** R6 — fed from /api/lifestyle-targets; SleepCard + StressCard + ProteinHitCard read. */
  lifestyleTargets: LifestyleTargetLite[];
  /** R9 — fed from /api/lifestyle-logs; manual entries override Fitbit values per date. */
  lifestyleLogs: LifestyleLogLite[];
  /** R6 — fed from /api/nutrition/meals/range; ProteinHitCard reads. */
  dailyProtein: DailyProteinPoint[];
  /** R9 — called when an inline "Log today" affordance writes a row;
   *  parent merges into local state so the chart updates without a refetch. */
  onLogged?: (log: LifestyleLogLite) => void;
}

export default function LifestylePanel({
  stretchRoutine,
  recentCheckIns,
  programId,
  programStartDate,
  programDurationWeeks,
  dailyMetrics,
  lifestyleTargets,
  lifestyleLogs,
  dailyProtein,
  onLogged,
}: Props) {
  const latest = recentCheckIns[0] ?? null;
  const durationWeeks = programDurationWeeks ?? 16;

  return (
    <div className="space-y-4">
      <CheckInCard latest={latest} count={recentCheckIns.length} />
      <StretchCard routine={stretchRoutine} />
      <RecoveryTrendCard checkIns={recentCheckIns} />

      {/* Daily vitals strip — verbatim port of gameplan-active.jsx
          LifestyleTab (lines 1989–2008). 3 cards: Sleep / Stress /
          Protein. All three read real R6 schema fields:
          DailyMetric.sleepMinutes (Sleep), DailyMetric.stress (Stress),
          and per-day protein totals from /api/nutrition/meals/range. */}
      <SectionH kicker="HABITS · 16-WEEK PLAN" sprayWidth={170}>
        DAILY VITALS
      </SectionH>
      <Archivo
        size={10}
        color="rgb(var(--ft-text-on-bg-ter))"
        style={{ display: "block", lineHeight: 1.45, marginBottom: 12 }}
      >
        Where you&apos;re at vs the plan to date. Solid line = you. Dashed = plan.
      </Archivo>
      <div className="flex flex-col gap-3.5">
        <SleepCard
          dailyMetrics={dailyMetrics}
          lifestyleTargets={lifestyleTargets}
          lifestyleLogs={lifestyleLogs}
          programStartDate={programStartDate}
          durationWeeks={durationWeeks}
          tilt={-0.4}
          programId={programId}
          onLogged={onLogged}
        />
        <StressCard
          dailyMetrics={dailyMetrics}
          lifestyleTargets={lifestyleTargets}
          lifestyleLogs={lifestyleLogs}
          programStartDate={programStartDate}
          durationWeeks={durationWeeks}
          tilt={0.4}
          programId={programId}
          onLogged={onLogged}
        />
        <ProteinHitCard
          dailyProtein={dailyProtein}
          lifestyleTargets={lifestyleTargets}
          programStartDate={programStartDate}
          durationWeeks={durationWeeks}
          tilt={-0.3}
        />
      </div>
      {programId && (
        <EditPlanBtn
          align="flex-end"
          href={`/gameplan/${programId}/planning?tab=lifestyle`}
          label="EDIT LIFESTYLE"
        />
      )}
    </div>
  );
}

function CheckInCard({ latest, count }: { latest: CheckIn | null; count: number }) {
  if (!latest) {
    return (
      <div className="ft-card bg-ft-surface border border-ft-border p-4">
        <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-dim mb-1">
          WEEKLY CHECK-IN
        </div>
        <div className="font-display text-lg text-ft-white leading-tight">No check-ins yet</div>
        <p className="font-body text-xs text-ft-light mt-2">
          A weekly check-in tracks energy, sleep, soreness, and adherence — useful for spotting
          recovery debt before it compounds.
        </p>
        <div className="mt-3 font-body text-[11px] uppercase tracking-[0.15em] text-ft-dim">
          (Check-in screen coming soon)
        </div>
      </div>
    );
  }

  const pillars: { label: string; value: number | null }[] = [
    { label: "ENERGY", value: latest.energy },
    { label: "SLEEP", value: latest.sleepQuality },
    { label: "SORENESS", value: latest.soreness },
    { label: "STRESS", value: latest.stress },
    { label: "MOTIVATION", value: latest.motivation },
  ];

  return (
    <div className="ft-card bg-ft-surface border border-ft-border p-4">
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-dim">
            WEEKLY CHECK-IN
          </div>
          <div className="font-display text-lg text-ft-white leading-tight">
            {formatDate(latest.date)}
          </div>
        </div>
        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-ft-dim">
          {count} on record
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 mt-3">
        {pillars.map((p) => (
          <RatingBlock key={p.label} label={p.label} value={p.value} />
        ))}
      </div>
      {(latest.wins || latest.struggles) && (
        <div className="mt-3 pt-3 border-t border-dashed border-ft-border space-y-2">
          {latest.wins && (
            <div>
              <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-success">
                WINS
              </div>
              <p className="font-body text-xs text-ft-white mt-0.5">{latest.wins}</p>
            </div>
          )}
          {latest.struggles && (
            <div>
              <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-warn">
                STRUGGLES
              </div>
              <p className="font-body text-xs text-ft-white mt-0.5">{latest.struggles}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RatingBlock({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const color =
    v >= 4 ? "rgb(var(--ft-success))" : v >= 3 ? "rgb(var(--ft-accent))" : v > 0 ? "rgb(var(--ft-warn))" : "rgb(var(--ft-dim))";
  return (
    <div className="text-center">
      <div className="font-data text-2xl leading-none" style={{ color }}>
        {value ?? "—"}
      </div>
      <div className="font-body text-[7px] uppercase tracking-[0.2em] text-ft-dim mt-1 truncate">
        {label}
      </div>
    </div>
  );
}

function StretchCard({ routine }: { routine: StretchRoutine | null }) {
  if (!routine) {
    return (
      <div className="ft-card bg-ft-surface border border-ft-border p-4">
        <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-dim mb-1">
          MOBILITY
        </div>
        <div className="font-display text-lg text-ft-white leading-tight">No routine set</div>
        <Link
          href="/stretch-timer"
          className="mt-3 inline-block font-body text-[11px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent"
        >
          Set up stretch timer →
        </Link>
      </div>
    );
  }
  const totalSeconds = routine.items.reduce((sum, i) => sum + i.durationSeconds * (i.bilateral ? 2 : 1), 0);
  return (
    <div className="ft-card bg-ft-surface border border-ft-border p-4">
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-dim">MOBILITY</div>
          <div className="font-display text-lg text-ft-white leading-tight">{routine.name}</div>
        </div>
        <div className="text-right">
          <span className="font-data text-xl text-ft-white">{Math.round(totalSeconds / 60)}</span>
          <span className="font-body text-[9px] uppercase tracking-[0.15em] text-ft-dim ml-1">
            MIN
          </span>
        </div>
      </div>
      <div className="font-body text-xs text-ft-light">
        {routine.items.length} stretch{routine.items.length === 1 ? "" : "es"} ·{" "}
        {routine.items.filter((i) => i.bilateral).length} bilateral
      </div>
      <Link
        href="/stretch-timer"
        className="mt-3 inline-block cta-underline font-display text-base text-ft-accent"
      >
        Run now →
      </Link>
    </div>
  );
}

function RecoveryTrendCard({ checkIns }: { checkIns: CheckIn[] }) {
  if (checkIns.length === 0) return null;
  const ordered = [...checkIns].slice(0, 4).reverse();
  return (
    <div className="ft-card bg-ft-surface border border-ft-border p-4">
      <div className="font-body text-[9px] uppercase tracking-[0.25em] text-ft-dim mb-3">
        ENERGY · LAST {ordered.length} CHECK-INS
      </div>
      <div className="flex items-end gap-2 h-16">
        {ordered.map((c, i) => {
          const v = c.energy ?? 0;
          return (
            <div key={c.id ?? i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div
                className="w-full"
                style={{
                  height: `${(v / 5) * 100}%`,
                  background: v >= 4 ? "rgb(var(--ft-success))" : v >= 3 ? "rgb(var(--ft-accent))" : "rgb(var(--ft-warn))",
                  minHeight: v > 0 ? "4px" : "1px",
                  opacity: v > 0 ? 1 : 0.2,
                }}
              />
              <span className="font-body text-[8px] tracking-[0.1em] text-ft-dim">
                {formatDate(c.date, true)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(iso: string, compact = false): string {
  const d = new Date(iso);
  if (compact) {
    return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  }
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
