"use client";

/**
 * Sleep card — daily hours-per-night line over the program canvas.
 *
 * Reads `DailyMetric.sleepMinutes` directly (R6 schema landing —
 * resolves the prior weekly-CheckIn synthesis). Sleep target band
 * driven by `LifestyleTarget` rows when present, otherwise defaults
 * to 7.5h.
 */

import { useMemo } from "react";
import { LifestyleShell } from "./LifestyleShell";
import { LifestyleQuickLog } from "./LifestyleQuickLog";
import { Reenie, Archivo } from "./typography";
import { lifestyleVariable } from "@/lib/goal-engine/lifestyle-variables";
import type { DailyMetricLite, LifestyleTargetLite, LifestyleLogLite } from "./types";

const W = 348;
const H = 86;
const PAD_T = 8;
const PAD_B = 16;
const PAD_L = 22;
const PAD_R = 8;
const TOTAL_DAYS = 112;

export function SleepCard({
  dailyMetrics,
  lifestyleTargets = [],
  lifestyleLogs = [],
  durationWeeks = 16,
  programStartDate,
  tilt = -0.4,
  programId = null,
  onLogged,
}: {
  /** DailyMetric rows for this user, sourced from /api/integrations/fitbit/daily. */
  dailyMetrics: DailyMetricLite[];
  /** Optional LifestyleTarget rows; "sleep_hours_min" drives the target line. */
  lifestyleTargets?: LifestyleTargetLite[];
  /** R9 — LifestyleLog rows; sleep_duration manual entries override Fitbit values. */
  lifestyleLogs?: LifestyleLogLite[];
  durationWeeks?: number;
  programStartDate: string | null;
  tilt?: number;
  programId?: string | null;
  onLogged?: (log: LifestyleLogLite) => void;
}) {
  const points = useMemo(
    () => mergeSleepPoints(dailyMetrics, lifestyleLogs, programStartDate, durationWeeks),
    [dailyMetrics, lifestyleLogs, programStartDate, durationWeeks],
  );
  const todaysLog = useMemo(
    () => latestLogForKey(lifestyleLogs, "sleep_duration"),
    [lifestyleLogs],
  );
  const sleepVar = lifestyleVariable("sleep_duration");

  // Target: prefer a lifestyle-target row keyed "sleep_hours_min";
  // fallback to 7.5h.
  const sleepTarget = lifestyleTargets.find((t) => t.key === "sleep_hours_min");
  const targetH = sleepTarget?.value ?? 7.5;

  // Hero value = rolling 7-day average of the last 7 days that have data.
  const last7 = points.slice(-7).map((p) => p.hours);
  const avg = last7.length ? last7.reduce((s, v) => s + v, 0) / last7.length : 0;
  const avgH = Math.floor(avg);
  const avgM = Math.round((avg - avgH) * 60);
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

  // Target band: ±0.25h around the user's sleep target.
  const targetTop = yAt(targetH + 0.25);
  const targetBot = yAt(targetH - 0.25);
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
      kicker="HOURS PER NIGHT"
      statusLabel={status}
      hero={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: "rgb(var(--ft-text-primary))", lineHeight: 0.85 }}>
            {avgH}
            <span style={{ fontSize: 28 }}>h</span> {avgM}
            <span style={{ fontSize: 28 }}>m</span>
          </Reenie>
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".14em" }}>
            7-DAY AVG
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
      inlineLog={
        sleepVar ? (
          <LifestyleQuickLog
            variable={sleepVar}
            todaysLog={todaysLog}
            programId={programId}
            onLogged={onLogged}
          />
        ) : null
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
              TARGET {targetH.toFixed(1)}h
            </Archivo>
          </div>
        </div>
      }
    />
  );
}

/**
 * R9 — merge Fitbit DailyMetric sleep with manual LifestyleLog
 * sleep_duration rows. When both sources have a value for the same
 * date, the manual log wins (explicit user statement beats passive
 * device read). Fitbit-only days still appear so charts stay dense.
 */
function mergeSleepPoints(
  metrics: DailyMetricLite[],
  logs: LifestyleLogLite[],
  programStart: string | null,
  durationWeeks: number,
): Array<{ dayIndex: number; hours: number }> {
  if (!programStart) return [];
  const start = new Date(programStart).getTime();
  const totalDays = durationWeeks * 7;
  const byDate = new Map<string, number>();
  for (const m of metrics) {
    if (m.sleepMinutes == null) continue;
    byDate.set(m.date.slice(0, 10), m.sleepMinutes / 60);
  }
  for (const l of logs) {
    if (l.variableKey !== "sleep_duration" || l.numValue == null) continue;
    byDate.set(l.date.slice(0, 10), l.numValue);
  }
  const points: Array<{ dayIndex: number; hours: number }> = [];
  byDate.forEach((hours, date) => {
    const day = Math.floor((new Date(date).getTime() - start) / 86400000);
    if (day < 0 || day > totalDays) return;
    points.push({ dayIndex: day, hours });
  });
  return points.sort((a, b) => a.dayIndex - b.dayIndex);
}

function latestLogForKey(logs: LifestyleLogLite[], key: string): LifestyleLogLite | null {
  const todayIso = new Date().toISOString().slice(0, 10);
  // Prefer today's row if it exists; otherwise the most recent overall
  // (the QuickLog form treats it as "current value to overwrite").
  const todayRow = logs.find((l) => l.variableKey === key && l.date === todayIso);
  if (todayRow) return todayRow;
  const all = logs.filter((l) => l.variableKey === key).sort((a, b) => b.date.localeCompare(a.date));
  return all[0] ?? null;
}
