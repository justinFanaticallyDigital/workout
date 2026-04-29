"use client";

/**
 * Stress card — prototype layout adapted to live data.
 *
 * **Schema gap (flagged for R6)**: gameplan-active.jsx#StressCard
 * (lines 1708–1834) renders a 39-day daily 1-10 bar series. Live
 * `CheckIn.stress` is **weekly 1-5**, not daily 1-10. R6 needs
 * `DailyMetric.stress`. Until then we render check-in points (1-5
 * mapped to 2-10 with linear scaling) and adherence vs a "≤5"
 * threshold.
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

export function StressCard({
  recentCheckIns,
  durationWeeks = 16,
  programStartDate,
  tilt = 0.4,
}: {
  recentCheckIns: CheckIn[];
  durationWeeks?: number;
  programStartDate: string | null;
  tilt?: number;
}) {
  const points = useMemo(
    () => mapCheckInsToStress(recentCheckIns, programStartDate, durationWeeks),
    [recentCheckIns, programStartDate, durationWeeks],
  );
  const target = 5;
  const hits = points.filter((p) => p.value <= target).length;
  const adherence = points.length ? Math.round((hits / points.length) * 100) : 0;
  const tone: "red" | "yellow" | "green" =
    adherence >= 80 ? "green" : adherence >= 60 ? "yellow" : "red";
  const status = tone === "green" ? "IN BAND" : tone === "yellow" ? "OK" : "OVER";
  const today = points[points.length - 1]?.value ?? 0;

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const yMin = 0;
  const yMax = 10;
  const ySpan = yMax - yMin;
  const xAt = (d: number) => PAD_L + (d / (TOTAL_DAYS - 1)) * innerW;
  const yAt = (v: number) => PAD_T + (1 - (v - yMin) / ySpan) * innerH;
  const targetY = yAt(target);
  const weekTicks = [0, 4, 8, 12, durationWeeks];
  const barW = (innerW / TOTAL_DAYS) * 6.5; // wider since we render weekly cadence

  return (
    <LifestyleShell
      name="STRESS"
      icon="bolt"
      tone={tone}
      tilt={tilt}
      kicker="WEEKLY 1–5 SCALED TO 1–10"
      statusLabel={status}
      hero={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: "rgb(var(--ft-text-primary))", lineHeight: 0.85 }}>
            {today}
          </Reenie>
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".14em" }}>
            / 10 · LATEST
          </Archivo>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <Archivo
              size={8}
              color="rgb(var(--ft-text-tertiary))"
              style={{ letterSpacing: ".14em", display: "block" }}
            >
              IN BAND
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
              {hits}/{points.length} · {adherence}%
            </Archivo>
          </div>
        </div>
      }
      chart={
        <svg width={W} height={H} aria-hidden style={{ display: "block" }}>
          <rect x={PAD_L} y={PAD_T} width={innerW} height={targetY - PAD_T} fill="rgb(var(--ft-legs))" opacity=".06" />
          <line
            x1={PAD_L}
            y1={targetY}
            x2={W - PAD_R}
            y2={targetY}
            stroke="rgb(var(--ft-accent))"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity=".7"
          />
          <text
            x={W - PAD_R - 2}
            y={targetY - 3}
            fontSize="7"
            fill="rgb(var(--ft-accent))"
            className="font-data"
            textAnchor="end"
            letterSpacing=".08em"
            opacity=".85"
          >
            ≤ {target} TARGET
          </text>
          {[2, 5, 8].map((v) => (
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
                {v}
              </text>
            </g>
          ))}
          {points.map((p, i) => {
            const x = xAt(p.dayIndex) - barW / 2;
            const top = yAt(p.value);
            const overBand = p.value > target;
            return (
              <rect
                key={i}
                x={x}
                y={top}
                width={barW}
                height={Math.max(1, H - PAD_B - top)}
                fill={overBand ? "rgb(var(--ft-legs))" : "rgb(var(--ft-pull))"}
                opacity={i === points.length - 1 ? 1 : 0.55}
              />
            );
          })}
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
            <span style={{ width: 8, height: 8, background: "rgb(var(--ft-pull))", display: "inline-block" }} />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              IN BAND
            </Archivo>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, background: "rgb(var(--ft-legs))", display: "inline-block" }} />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              OVER
            </Archivo>
          </div>
        </div>
      }
    />
  );
}

/**
 * Map weekly `CheckIn.stress` (1-5) to a 1-10 scale. **R6**: replace
 * with `DailyMetric.stress` direct read once the column exists.
 */
function mapCheckInsToStress(
  checkIns: CheckIn[],
  programStart: string | null,
  durationWeeks: number,
): Array<{ dayIndex: number; value: number }> {
  if (!programStart || checkIns.length === 0) return [];
  const start = new Date(programStart).getTime();
  const totalDays = durationWeeks * 7;
  const points: Array<{ dayIndex: number; value: number }> = [];
  for (const c of [...checkIns].reverse()) {
    if (c.stress == null) continue;
    const day = Math.floor((new Date(c.date).getTime() - start) / 86400000);
    if (day < 0 || day > totalDays) continue;
    // Linear 1-5 → 2-10 scale (so a "3" reads as "6/10" in the prototype's idiom).
    const value = (c.stress - 1) * 2 + 2;
    points.push({ dayIndex: day, value });
  }
  return points;
}
