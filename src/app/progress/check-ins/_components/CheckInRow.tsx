"use client";

/**
 * R11 — single row in the /progress/check-ins history list.
 *
 * Shows the check-in's date, ISO week, status pill, 5-rating dots
 * (energy / sleep / soreness / stress / motivation), the count +
 * kinds of recommendations the engine fired this check-in, and any
 * GameplanChange rows that were applied as a result.
 *
 * Click → /checkin/[id] for the per-week detail view.
 */

import Link from "next/link";

interface CheckInLite {
  id: string;
  date: string;
  weekNumber: number | null;
  energy: number | null;
  sleepQuality: number | null;
  soreness: number | null;
  stress: number | null;
  motivation: number | null;
}

interface RecLite {
  id: string;
  kind: string;
  status: string;
  checkInId: string | null;
}

interface ChangeLite {
  id: string;
  recommendationId: string | null;
  field: string;
}

export function CheckInRow({
  checkIn,
  recs,
  changes,
}: {
  checkIn: CheckInLite;
  recs: RecLite[];
  changes: ChangeLite[];
}) {
  const recsForCheckIn = recs.filter((r) => r.checkInId === checkIn.id);
  const recIdSet = new Set(recsForCheckIn.map((r) => r.id));
  const appliedChanges = changes.filter(
    (c) => c.recommendationId && recIdSet.has(c.recommendationId),
  );
  const dismissed = recsForCheckIn.filter((r) => r.status === "dismissed").length;
  const applied = recsForCheckIn.filter((r) => r.status === "applied").length;
  const pending = recsForCheckIn.filter((r) => r.status === "pending").length;

  const pillars: Array<{ key: string; value: number | null }> = [
    { key: "EN", value: checkIn.energy },
    { key: "SL", value: checkIn.sleepQuality },
    { key: "SR", value: checkIn.soreness },
    { key: "ST", value: checkIn.stress },
    { key: "MO", value: checkIn.motivation },
  ];

  return (
    <Link
      href={`/checkin/${checkIn.id}`}
      className="block ft-card bg-ft-surface border border-ft-border p-4 hover:border-ft-accent transition-colors"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-display text-lg text-ft-on-bg leading-tight">
            {formatDate(checkIn.date)}
          </div>
          <div className="font-body text-[10px] uppercase tracking-[0.18em] text-ft-on-bg-ter mt-0.5">
            {checkIn.weekNumber != null ? `Week ${checkIn.weekNumber}` : "—"}
          </div>
        </div>
        <span className="font-body text-[9px] uppercase tracking-[0.14em] text-ft-on-bg-sec border border-ft-border px-2 py-0.5">
          REVIEWED
        </span>
      </div>

      {/* Rating dots */}
      <div className="flex items-center gap-3 mt-3">
        {pillars.map((p) => (
          <div key={p.key} className="flex items-center gap-1.5">
            <Dot value={p.value} />
            <span className="font-body text-[8px] uppercase tracking-[0.18em] text-ft-on-bg-ter">
              {p.key}
            </span>
          </div>
        ))}
      </div>

      {/* Engine output strip */}
      {recsForCheckIn.length === 0 ? (
        <div className="mt-3 pt-3 border-t border-dashed border-ft-border">
          <span className="font-body text-[10px] uppercase tracking-[0.16em] text-ft-on-bg-ter">
            No recs fired
          </span>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-dashed border-ft-border flex items-center gap-2 flex-wrap">
          <CountPill label="RECS" count={recsForCheckIn.length} tone="info" />
          {applied > 0 && <CountPill label="APPLIED" count={applied} tone="success" />}
          {pending > 0 && <CountPill label="PENDING" count={pending} tone="warn" />}
          {dismissed > 0 && <CountPill label="DISMISSED" count={dismissed} tone="muted" />}
          {appliedChanges.length > 0 && (
            <span className="font-body text-[9px] uppercase tracking-[0.14em] text-ft-on-bg-ter ml-auto">
              {appliedChanges.length} change{appliedChanges.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function Dot({ value }: { value: number | null }) {
  const v = value ?? 0;
  const color =
    v >= 4
      ? "rgb(var(--ft-success))"
      : v >= 3
      ? "rgb(var(--ft-accent))"
      : v > 0
      ? "rgb(var(--ft-warn))"
      : "rgb(var(--ft-border))";
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        opacity: v > 0 ? 1 : 0.3,
      }}
    />
  );
}

function CountPill({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "info" | "success" | "warn" | "muted";
}) {
  const color =
    tone === "success"
      ? "rgb(var(--ft-success-fg))"
      : tone === "warn"
      ? "rgb(var(--ft-warn-fg))"
      : tone === "muted"
      ? "rgb(var(--ft-on-bg-ter))"
      : "rgb(var(--ft-info-fg))";
  return (
    <span
      className="font-body text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 border"
      style={{ borderColor: color, color }}
    >
      {count} {label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
