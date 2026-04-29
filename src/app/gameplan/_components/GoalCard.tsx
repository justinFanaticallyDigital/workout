"use client";

/**
 * Single goal-pulse card. Verbatim port of gameplan-active.jsx
 * #GoalCard (lines 1093–1180): icon tile + label + value + unit +
 * MiniTrajectory + delta badge + target row + GRAPH → tap hint.
 *
 * Tilt is a graffiti idiom; non-graffiti chromes flatten via `tilt=0`.
 */

import { useMemo } from "react";
import { Marker, Reenie, Archivo } from "./typography";
import { GoalIcon, type GoalIconKind } from "./icons";
import { MiniTrajectory } from "./MiniTrajectory";
import { buildSeries, isAheadOf, type SeriesInput } from "./seriesUtil";
import { useTheme } from "@/providers/ThemeProvider";

export interface GoalPlan {
  label: string;
  icon: GoalIconKind;
  /** Display value (already formatted). */
  value: string;
  unit: string;
  /** Target display string (e.g. "168" or "275"). */
  target: string;
  /** "green" | "yellow" | "red" — drives toneColor. */
  tone: "green" | "yellow" | "red";
  series: SeriesInput;
}

export function GoalCard({
  goal,
  tilt = 0,
  onTap,
}: {
  goal: GoalPlan;
  tilt?: number;
  onTap: () => void;
}) {
  const { chrome } = useTheme();
  const graffiti = chrome === "graffiti";
  const toneColor =
    goal.tone === "green"
      ? "rgb(var(--ft-pull))"
      : goal.tone === "yellow"
      ? "rgb(var(--ft-core))"
      : "rgb(var(--ft-legs))";

  const built = useMemo(() => buildSeries(goal.series), [goal.series]);
  const delta = built.rolling7[built.currentDay] - built.expected[built.currentDay];
  const ahead = isAheadOf(
    built.rolling7[built.currentDay],
    built.expected[built.currentDay],
    goal.series.target,
    goal.series.start,
  );
  const sign = delta >= 0 ? "+" : "−";
  const deltaAbs = Math.abs(delta).toFixed(goal.series.decimals ?? 1);
  void ahead;

  return (
    <button
      onClick={onTap}
      aria-label={`Open ${goal.label} trajectory graph`}
      style={{
        flex: "0 0 116px",
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border-faint))",
        padding: "10px 9px 9px",
        transform: graffiti ? `rotate(${tilt}deg)` : "none",
        boxShadow: graffiti ? "0 2px 0 rgba(0,0,0,.30)" : "0 1px 2px rgba(0,0,0,.08)",
        position: "relative",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* row 1: icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div
          style={{
            width: 24,
            height: 24,
            border: `1.5px solid ${toneColor}`,
            background: `${toneColor}`,
            backgroundColor: "transparent",
            display: "grid",
            placeItems: "center",
            transform: graffiti ? "rotate(-3deg)" : "none",
            flexShrink: 0,
            color: toneColor,
          }}
        >
          <GoalIcon kind={goal.icon} size={14} />
        </div>
        <Archivo
          size={8}
          color="rgb(var(--ft-text-tertiary))"
          style={{ letterSpacing: ".14em", lineHeight: 1.05, flex: 1, minWidth: 0, textTransform: "uppercase" }}
        >
          {goal.label}
        </Archivo>
      </div>

      {/* row 2: value + unit */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 3, lineHeight: 1 }}>
        <Reenie style={{ fontSize: 34, color: "rgb(var(--ft-text-primary))" }}>{goal.value}</Reenie>
        <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
          {goal.unit}
        </Archivo>
      </div>

      {/* row 3: mini trajectory chart */}
      <div style={{ position: "relative" }}>
        <MiniTrajectory series={goal.series} color={toneColor} width={98} height={32} />
        <div
          className="font-data tabular-nums"
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            padding: "1px 4px",
            background: `${toneColor}`,
            backgroundColor: "transparent",
            border: `1px solid ${toneColor}`,
            fontSize: 8,
            color: toneColor,
            letterSpacing: ".05em",
            lineHeight: 1.1,
          }}
        >
          {sign}
          {deltaAbs}
        </div>
      </div>

      {/* row 4: target + tap hint */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 5,
          borderTop: "1px dashed rgb(var(--ft-border-faint))",
        }}
      >
        <Marker style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 5,
              height: 5,
              background: "rgb(var(--ft-accent))",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
            {goal.target}
            {goal.unit === "HRS" ? "h" : ""}
          </Archivo>
        </Marker>
        <Archivo size={7} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".18em" }}>
          GRAPH →
        </Archivo>
      </div>
    </button>
  );
}
