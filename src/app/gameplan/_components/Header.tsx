"use client";

import type { ActiveProgram, ActiveBlock } from "./types";

interface Props {
  program: ActiveProgram;
  block: ActiveBlock | null;
}

/**
 * Sticky header strip — program name, week-of-total, current block,
 * active badge, days-left counter, and the week progress bar.
 *
 * Computes week-in-program from program.startDate, with a graceful
 * fallback if startDate is null.
 */
export default function Header({ program, block }: Props) {
  const totalWeeks = program.durationWeeks ?? 12;
  const currentWeek = computeCurrentWeek(program.startDate, totalWeeks);
  const daysLeft = computeDaysLeft(program.startDate, totalWeeks);
  const weekPct = Math.min(100, Math.max(0, (currentWeek / totalWeeks) * 100));

  return (
    <header className="ft-card bg-ft-surface border-b border-ft-border px-5 py-4 sticky top-0 z-10">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl text-ft-white tracking-wide leading-tight m-0 truncate">
            {program.name}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-body text-[9px] uppercase tracking-[0.18em] text-ft-light">
              WEEK {currentWeek} OF {totalWeeks}
            </span>
            {block && (
              <>
                <span className="w-1 h-1 rounded-full bg-ft-border" />
                <span className="font-body text-[9px] uppercase tracking-[0.18em] text-ft-light">
                  BLOCK {block.blockNumber}: {block.name.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-ft-success/40 bg-ft-success/10">
            <span className="w-1.5 h-1.5 rounded-full bg-ft-success" />
            <span className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-success">ACTIVE</span>
          </span>
          {daysLeft !== null && (
            <div className="mt-2 leading-none">
              <span className="font-data text-3xl text-ft-white">{daysLeft}</span>
              <div className="font-body text-[8px] uppercase tracking-[0.2em] text-ft-dim mt-0.5">
                DAYS LEFT
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 relative">
        <div className="h-1.5 bg-ft-border/40 border border-ft-border/40 relative">
          <div
            className="absolute inset-y-0 left-0 bg-ft-accent"
            style={{ width: `${weekPct}%` }}
            aria-label={`Week ${currentWeek} of ${totalWeeks}`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-body text-[8px] uppercase tracking-[0.15em] text-ft-dim">W1</span>
          <span className="font-body text-[8px] uppercase tracking-[0.15em] text-ft-dim">W{totalWeeks}</span>
        </div>
      </div>
    </header>
  );
}

function computeCurrentWeek(startDateStr: string | null, totalWeeks: number): number {
  if (!startDateStr) return 1;
  const start = new Date(startDateStr).getTime();
  const now = Date.now();
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  if (days < 0) return 1;
  const week = Math.floor(days / 7) + 1;
  return Math.min(Math.max(1, week), totalWeeks);
}

function computeDaysLeft(startDateStr: string | null, totalWeeks: number): number | null {
  if (!startDateStr) return null;
  const start = new Date(startDateStr).getTime();
  const end = start + totalWeeks * 7 * 24 * 60 * 60 * 1000;
  const days = Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}
