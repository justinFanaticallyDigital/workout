"use client";

import type { ProgramBlock } from "./types";

const PHASE_COLOR: Record<string, string> = {
  accumulation: "rgb(var(--ft-pull))",
  intensification: "rgb(var(--ft-push))",
  peaking: "rgb(var(--ft-legs))",
  peak_week: "rgb(var(--ft-legs))",
  deload: "rgb(var(--ft-core))",
  prep: "rgb(var(--ft-accent))",
};

function phaseColor(phase: string | null): string {
  if (!phase) return "rgb(var(--ft-accent))";
  return PHASE_COLOR[phase] ?? "rgb(var(--ft-accent))";
}

/**
 * All blocks in the program as a horizontal timeline. Active block is
 * highlighted. Each block segment is sized proportional to its
 * durationWeeks so the bar reads as the program calendar.
 */
export default function BlockTimeline({
  blocks,
  activeBlockId,
  currentWeekInActiveBlock = null,
}: {
  blocks: ProgramBlock[];
  activeBlockId: string | null;
  /** 0-indexed week within the active block (e.g. 1 = "we're at the start of week 2"). */
  currentWeekInActiveBlock?: number | null;
}) {
  if (blocks.length === 0) {
    return <div className="font-body text-xs text-ft-dim">No blocks defined yet.</div>;
  }
  const totalWeeks = blocks.reduce((sum, b) => sum + (b.durationWeeks ?? 4), 0) || 1;

  return (
    <div className="space-y-2">
      {/* Compact horizontal bar — verbatim port of gameplan-active.jsx
          #BlockTimeline (lines 1258–1311) with current-week marker
          line on the active block. `currentWeekInBlock` is the
          week-of-block (1-indexed) computed from program.startDate
          + sum of prior block durations. */}
      <div className="flex w-full gap-[3px]" style={{ height: 28 }}>
        {blocks.map((b) => {
          const w = b.durationWeeks ?? 4;
          const pct = (w / totalWeeks) * 100;
          const color = phaseColor(b.phase);
          const isActive = b.id === activeBlockId;
          const currentWeekInBlock = isActive ? currentWeekInActiveBlock : null;
          return (
            <div
              key={b.id}
              style={{
                width: `${pct}%`,
                position: "relative",
                background: isActive ? color : "rgb(var(--ft-border-faint))",
                border: isActive
                  ? `1px solid ${color}`
                  : "1px solid rgb(var(--ft-border-faint))",
                opacity: isActive ? 1 : 0.85,
              }}
              aria-label={`Block ${b.blockNumber}: ${b.name}, ${w} weeks${isActive ? ", active" : ""}`}
            >
              {currentWeekInBlock != null && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -6,
                    bottom: -6,
                    left: `${(currentWeekInBlock / w) * 100}%`,
                    width: 3,
                    background: "rgb(var(--ft-text-primary))",
                    boxShadow: "0 0 6px rgb(var(--ft-text-primary) / 0.55)",
                  }}
                />
              )}
              <span
                className="font-data"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: isActive ? "rgb(var(--ft-text-on-accent))" : "rgb(var(--ft-text-tertiary))",
                  letterSpacing: ".1em",
                }}
              >
                B{b.blockNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-block list */}
      <div className="flex flex-col gap-1.5">
        {blocks.map((b) => {
          const color = phaseColor(b.phase);
          const isActive = b.id === activeBlockId;
          return (
            <div
              key={b.id}
              className={[
                "ft-card flex items-center gap-3 p-2.5 border",
                isActive ? "border-ft-accent bg-ft-surface" : "border-ft-border bg-ft-surface/60",
              ].join(" ")}
            >
              <div
                className="w-1 self-stretch shrink-0"
                style={{ background: color }}
                aria-hidden
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-base text-ft-white tracking-wide">
                    Block {b.blockNumber}: {b.name}
                  </span>
                  {b.phase && (
                    <span
                      className="font-body text-[8px] uppercase tracking-[0.2em] px-1.5 py-0.5 border"
                      style={{ color, borderColor: `${color}66` }}
                    >
                      {b.phase.replace("_", " ")}
                    </span>
                  )}
                  {isActive && (
                    <span className="font-body text-[8px] uppercase tracking-[0.2em] text-ft-accent">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-data text-base text-ft-white">{b.durationWeeks ?? "?"}</span>
                <span className="font-body text-[8px] uppercase tracking-[0.18em] text-ft-dim ml-1">
                  WK
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
