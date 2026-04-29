"use client";

/**
 * Stress card — daily 1-10 bar series over the program canvas.
 *
 * Reads `DailyMetric.stress` directly (R6 schema landing — resolves
 * the prior 1-5→1-10 weekly check-in mapping). Threshold driven by
 * `LifestyleTarget` rows when present, otherwise defaults to ≤5.
 */

import { useMemo } from "react";
import { LifestyleShell } from "./LifestyleShell";
import { Reenie, Archivo } from "./typography";
import type { DailyMetricLite, LifestyleTargetLite } from "./types";

const W = 348;
const H = 86;
const PAD_T = 8;
const PAD_B = 16;
const PAD_L = 22;
const PAD_R = 8;
const TOTAL_DAYS = 112;

export function StressCard({
  dailyMetrics,
  lifestyleTargets = [],
  durationWeeks = 16,
  programStartDate,
  tilt = 0.4,
}: {
  dailyMetrics: DailyMetricLite[];
  lifestyleTargets?: LifestyleTargetLite[];
  durationWeeks?: number;
  programStartDate: string | null;
  tilt?: number;
}) {
  const points = useMemo(
    () => mapDailyMetricsToStress(dailyMetrics, programStartDate, durationWeeks),
    [dailyMetrics, programStartDate, durationWeeks],
  );
  // Target: prefer a lifestyle-target row keyed "stress_max"; default 5.
  const stressTarget = lifestyleTargets.find((t) => t.key === "stress_max");
  const target = stressTarget ? Math.round(stressTarget.value) : 5;
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
      kicker="DAILY 1–10 SCALE"
      statusLabel={status}
      hero={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: "rgb(var(--ft-text-primary))", lineHeight: 0.85 }}>
            {today}
          </Reenie>
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".14em" }}>
            / 10 · TODAY
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
 * Map `DailyMetric.stress` rows to (dayIndex, value) points along
 * the program canvas. R6 — replaces the prior weekly CheckIn.stress
 * 1-5→1-10 synthesis.
 */
function mapDailyMetricsToStress(
  metrics: DailyMetricLite[],
  programStart: string | null,
  durationWeeks: number,
): Array<{ dayIndex: number; value: number }> {
  if (!programStart || metrics.length === 0) return [];
  const start = new Date(programStart).getTime();
  const totalDays = durationWeeks * 7;
  const points: Array<{ dayIndex: number; value: number }> = [];
  for (const m of metrics) {
    if (m.stress == null) continue;
    const day = Math.floor((new Date(m.date).getTime() - start) / 86400000);
    if (day < 0 || day > totalDays) continue;
    points.push({ dayIndex: day, value: m.stress });
  }
  return points.sort((a, b) => a.dayIndex - b.dayIndex);
}
