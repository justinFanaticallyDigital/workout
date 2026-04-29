"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { fmtVolume, formatSec } from "./util";

/**
 * Sticky bottom action bar — running session stats + FINISH button.
 *
 * Ports `FinishBar` from logger-app.jsx (lines 883–953). The prototype
 * has one explicit chrome branch (arcade FINISH text-color = #000 when
 * pct === 1); fallback handles the other 6 themes via R0 tokens.
 *
 * Per-chrome attestations:
 *   arcade    → FINISH btn, when 100% complete: bg-accent + text-bg (#000 on neon pink)
 *   notebook  → 8px rounded radius (handwritten paper feel)
 *   lab       → 4px rounded progress bar
 *   iron / blueprint / cyberpunk / graffiti → sharp 0px, accent-bordered FINISH btn
 *
 * The TabNav directly below the FinishBar in the prototype is OMITTED
 * here — R1's BottomNav supersedes it app-wide and the logger pages
 * already hide the BottomNav when active.
 */
export default function FinishBar({
  setsDone,
  setsTotal,
  totalVolume,
  startTime,
  restEndsAt,
  onClearRest,
  finishing,
  onFinish,
}: {
  setsDone: number;
  setsTotal: number;
  totalVolume: number;
  startTime: number;
  restEndsAt: number | null;
  onClearRest: () => void;
  finishing: boolean;
  onFinish: () => void;
}) {
  const { chrome } = useTheme();
  const setsPct = setsTotal > 0 ? setsDone / setsTotal : 0;
  const isArcade = chrome === "arcade";
  const isLab = chrome === "lab";
  const isNotebook = chrome === "notebook";

  const finishBg =
    setsPct >= 1
      ? "rgb(var(--ft-accent))"
      : "rgb(var(--ft-surface))";
  const finishFg =
    setsPct >= 1
      ? isArcade
        ? "rgb(var(--ft-bg))"
        : "rgb(var(--ft-text-on-accent))"
      : "rgb(var(--ft-accent))";

  return (
    <div
      className="ft-card fixed bottom-0 left-0 right-0 z-30"
      style={{
        background: "rgb(var(--ft-surface))",
        borderTop: "1px solid rgb(var(--ft-border) / 0.7)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-end gap-3.5 min-w-0">
            <Stat label="SETS" value={`${setsDone}`} suffix={`/${setsTotal}`} />
            <Stat label="VOL" value={fmtVolume(totalVolume)} />
            <Stat label="TIME" value={<WorkoutMin startTime={startTime} />} />
            {restEndsAt && restEndsAt > Date.now() ? (
              <Stat
                label="REST"
                value={<RestCountdown endsAt={restEndsAt} onDone={onClearRest} />}
                accent
              />
            ) : null}
          </div>
          <button
            onClick={onFinish}
            disabled={finishing}
            className="font-body shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: "8px 14px",
              background: finishBg,
              border: "1px solid rgb(var(--ft-accent))",
              color: finishFg,
              borderRadius: isLab ? 4 : isNotebook ? 6 : 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            {finishing ? "Saving…" : "Finish"}
          </button>
        </div>
        <div
          style={{
            height: 3,
            marginTop: 6,
            background: "rgb(var(--ft-border) / 0.4)",
            overflow: "hidden",
            borderRadius: isLab ? 2 : 0,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${setsPct * 100}%`,
              background: "rgb(var(--ft-accent))",
              transition: "width .3s",
            }}
            aria-label={`${setsDone} of ${setsTotal} sets complete`}
          />
        </div>
      </div>
    </div>
  );
}

/** Single label/value block in the FinishBar. */
function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="leading-none min-w-0">
      <div
        className="font-data"
        style={{
          fontSize: 9,
          color: "rgb(var(--ft-text-tertiary))",
          letterSpacing: ".12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div className="mt-1">
        <span
          className="font-data tabular-nums"
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: accent
              ? "rgb(var(--ft-accent))"
              : "rgb(var(--ft-text-primary))",
          }}
        >
          {value}
        </span>
        {suffix && (
          <span
            className="font-data tabular-nums"
            style={{
              fontSize: 12,
              color: "rgb(var(--ft-text-tertiary))",
              fontWeight: 500,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/** Counts down from a fixed `endsAt` timestamp; renders "M:SS". */
function RestCountdown({ endsAt, onDone }: { endsAt: number; onDone: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  const remainingMs = Math.max(0, endsAt - now);
  useEffect(() => {
    if (remainingMs === 0) onDone();
  }, [remainingMs, onDone]);
  return <>{formatSec(Math.ceil(remainingMs / 1000))}</>;
}

/** Compact "Nm" elapsed-minutes counter. */
function WorkoutMin({ startTime }: { startTime: number }) {
  const [mins, setMins] = useState(() => Math.floor((Date.now() - startTime) / 60000));
  useEffect(() => {
    const id = setInterval(() => {
      setMins(Math.floor((Date.now() - startTime) / 60000));
    }, 30000);
    return () => clearInterval(id);
  }, [startTime]);
  return <>{mins}m</>;
}
