"use client";

/**
 * Compact 100×38 trajectory chart for GoalCards.
 *
 * Verbatim port of gameplan-active.jsx#MiniTrajectory (lines 1053–1091):
 *   - dashed expected line (info-tinted)
 *   - solid rolling-7 line (`color` prop drives tone)
 *   - current dot (filled, bg-stroked)
 *   - goal endpoint marker (accent)
 */

import { useMemo } from "react";
import { buildSeries, type SeriesInput } from "./seriesUtil";

export function MiniTrajectory({
  series,
  color,
  width = 100,
  height = 38,
}: {
  series: SeriesInput;
  color: string;
  width?: number;
  height?: number;
}) {
  const built = useMemo(() => buildSeries(series), [series]);
  const { rolling7, expected, currentDay, totalDays } = built;

  const padT = 4;
  const padB = 4;
  const padL = 2;
  const padR = 2;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const all = [...rolling7, ...expected];
  let yMin = Math.min(...all);
  let yMax = Math.max(...all);
  const yPad = (yMax - yMin) * 0.2 || 1;
  yMin -= yPad;
  yMax += yPad;
  const ySpan = yMax - yMin;

  const xAt = (d: number) => padL + (d / totalDays) * innerW;
  const yAt = (v: number) => padT + (1 - (v - yMin) / ySpan) * innerH;

  const expectedPath = expected
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");
  const rollingPath = rolling7
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden style={{ display: "block" }}>
      <path
        d={expectedPath}
        fill="none"
        stroke="rgb(var(--ft-info-fg))"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity=".55"
      />
      <path
        d={rollingPath}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xAt(currentDay)}
        cy={yAt(rolling7[currentDay])}
        r="2.2"
        fill={color}
        stroke="rgb(var(--ft-bg))"
        strokeWidth="1"
      />
      <circle cx={xAt(totalDays)} cy={yAt(series.target)} r="1.8" fill="rgb(var(--ft-accent))" />
    </svg>
  );
}
