"use client";

/**
 * Sleep card — prototype layout adapted to live data.
 *
 * **Schema gap (flagged for R6)**: gameplan-active.jsx#SleepCard
 * (lines 1564–1704) renders a daily hours-per-night line over a
 * 16-week canvas. Live `CheckIn.sleepQuality` is a **weekly 1-5
 * self-report**, not daily hours. R6 needs `DailyMetric.sleepHours`
 * for the prototype's granularity. Until then we render check-in
 * points (1-5 mapped to 5-9h equivalent) with weekly cadence and
 * mark the chart as derived-from-checkins inline.
 */

import { useMemo } from "react";
import { LifestyleShell } from "./LifestyleShell";
import { Reenie, Archivo } from "./typography";
import type { CheckIn } from "./types";

const W = 348;
const H = 86;
const PAD_T = 8;
const PAD_B = 16;
const PAD_L = 22;
const PAD_R = 8;
const TOTAL_DAYS = 112;

export function SleepCard({
  recentCheckIns,
  durationWeeks = 16,
  programStartDate,
  tilt = -0.4,
}: {
  recentCheckIns: CheckIn[];
  durationWeeks?: number;
  programStartDate: string | null;
  tilt?: number;
}) {
  const points = useMemo(
    () => mapCheckInsToHours(recentCheckIns, programStartDate, durationWeeks),
    [recentCheckIns, programStartDate, durationWeeks],
  );

  const last7 = points.slice(-1).map((p) => p.hours);
  const avg = last7.length ? last7.reduce((s, v) => s + v, 0) / last7.length : 0;
  const avgH = Math.floor(avg);
  const avgM = Math.round((avg - avgH) * 60);
  // Plan target: 7.5h.
  const targetH = 7.5;
  const delta = (avg || targetH) - targetH;
  const tone: "red" | "yellow" | "green" = delta < -0.5 ? "red" : delta < -0.15 ? "yellow" : "green";
  const status = tone === "red" ? "BEHIND" : tone === "yellow" ? "BELOW" : "ON TRACK";

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const yMin = 4.5;
  const yMax = 9;
  const ySpan = yMax - yMin;
  const xAt = (d: number) => PAD_L + (d / (TOTAL_DAYS - 1)) * innerW;
  const yAt = (v: number) => PAD_T + (1 - (v - yMin) / ySpan) * innerH;

  const targetTop = yAt(7.75);
  const targetBot = yAt(7.25);
  const weekTicks = [0, 4, 8, 12, durationWeeks];

  // Plan line: linear from start (target − 0.5h to make the line read
  // as "we want to climb to target") → target.
  const planPath = (() => {
    const start = targetH - 0.5;
    const segs: string[] = [];
    for (let d = 0; d <= TOTAL_DAYS; d += 7) {
      const v = start + ((targetH - start) * d) / TOTAL_DAYS;
      segs.push(`${segs.length === 0 ? "M" : "L"} ${xAt(d).toFixed(1)} ${yAt(v).toFixed(1)}`);
    }
    return segs.join(" ");
  })();

  // Actual rolling: rolling-2 average over our weekly check-in points.
  const actualPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.dayIndex).toFixed(1)} ${yAt(p.hours).toFixed(1)}`)
    .join(" ");

  return (
    <LifestyleShell
      name="SLEEP"
      icon="sleep"
      tone={tone}
      tilt={tilt}
      kicker="HOURS PER NIGHT · DERIVED FROM CHECK-INS"
      statusLabel={status}
      hero={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: "rgb(var(--ft-text-primary))", lineHeight: 0.85 }}>
            {avgH}
            <span style={{ fontSize: 28 }}>h</span> {avgM}
            <span style={{ fontSize: 28 }}>m</span>
          </Reenie>
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".14em" }}>
            LATEST CHECK-IN
          </Archivo>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <Archivo
              size={8}
              color="rgb(var(--ft-text-tertiary))"
              style={{ letterSpacing: ".14em", display: "block" }}
            >
              VS PLAN
            </Archivo>
            <Archivo
              size={13}
              color={
                tone === "green"
                  ? "rgb(var(--ft-pull))"
                  : tone === "yellow"
                  ? "rgb(var(--ft-core))"
                  : "rgb(var(--ft-legs))"
              }
              style={{ letterSpacing: ".04em" }}
            >
              {delta >= 0 ? "+" : "−"}
              {Math.abs(delta).toFixed(1)}h
            </Archivo>
          </div>
        </div>
      }
      chart={
        <svg width={W} height={H} aria-hidden style={{ display: "block" }}>
          <rect
            x={PAD_L}
            y={targetTop}
            width={innerW}
            height={targetBot - targetTop}
            fill="rgb(var(--ft-accent))"
            opacity=".08"
          />
          <line
            x1={PAD_L}
            y1={targetTop}
            x2={W - PAD_R}
            y2={targetTop}
            stroke="rgb(var(--ft-accent))"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity=".5"
          />
          {[5, 6, 7, 8].map((v) => (
            <g key={v}>
              <line x1={PAD_L - 2} y1={yAt(v)} x2={PAD_L} y2={yAt(v)} stroke="rgb(var(--ft-border))" strokeWidth="1" />
              <text
                x={PAD_L - 4}
                y={yAt(v) + 2.5}
                fontSize="7"
                fill="rgb(var(--ft-text-tertiary))"
                className="font-data"
                textAnchor="end"
                letterSpacing=".05em"
              >
                {v}h
              </text>
            </g>
          ))}
          <path
            d={planPath}
            fill="none"
            stroke="rgb(var(--ft-info-fg))"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity=".6"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={xAt(p.dayIndex)}
              cy={yAt(p.hours)}
              r="2.4"
              fill="rgb(var(--ft-pull))"
              opacity=".85"
            />
          ))}
          {points.length > 1 && (
            <path
              d={actualPath}
              fill="none"
              stroke={
                tone === "green"
                  ? "rgb(var(--ft-pull))"
                  : tone === "yellow"
                  ? "rgb(var(--ft-core))"
                  : "rgb(var(--ft-legs))"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {weekTicks.map((w) => {
            const d = (w / durationWeeks) * (TOTAL_DAYS - 1);
            return (
              <g key={w}>
                <line x1={xAt(d)} y1={H - PAD_B} x2={xAt(d)} y2={H - PAD_B + 3} stroke="rgb(var(--ft-border))" strokeWidth="1" />
                <text
                  x={xAt(d)}
                  y={H - 3}
                  fontSize="7"
                  fill="rgb(var(--ft-text-tertiary))"
                  className="font-data"
                  textAnchor="middle"
                  letterSpacing=".08em"
                >
                  W{w}
                </text>
              </g>
            );
          })}
        </svg>
      }
      footer={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 12,
                height: 2,
                background: "rgb(var(--ft-info-fg))",
                display: "inline-block",
                opacity: 0.6,
              }}
            />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              PLAN
            </Archivo>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, background: "rgb(var(--ft-accent))", display: "inline-block" }} />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              TARGET 7.5h
            </Archivo>
          </div>
        </div>
      }
    />
  );
}

/**
 * Map weekly `CheckIn.sleepQuality` (1-5) to an approximate
 * hours-per-night value. **R6**: replace with DailyMetric.sleepHours
 * direct read once the column exists.
 *
 * Mapping: 1 → 5h, 2 → 6h, 3 → 7h, 4 → 7.75h, 5 → 8.5h.
 */
function mapCheckInsToHours(
  checkIns: CheckIn[],
  programStart: string | null,
  durationWeeks: number,
): Array<{ dayIndex: number; hours: number }> {
  if (!programStart || checkIns.length === 0) return [];
  const start = new Date(programStart).getTime();
  const totalDays = durationWeeks * 7;
  const points: Array<{ dayIndex: number; hours: number }> = [];
  for (const c of [...checkIns].reverse()) {
    if (c.sleepQuality == null) continue;
    const day = Math.floor((new Date(c.date).getTime() - start) / 86400000);
    if (day < 0 || day > totalDays) continue;
    const hours =
      c.sleepQuality === 1
        ? 5
        : c.sleepQuality === 2
        ? 6
        : c.sleepQuality === 3
        ? 7
        : c.sleepQuality === 4
        ? 7.75
        : 8.5;
    points.push({ dayIndex: day, hours });
  }
  return points;
}
