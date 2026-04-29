"use client";

/**
 * Protein-hit card — daily 16-week × 7-day adherence calendar.
 *
 * Reads daily protein totals from `/api/nutrition/meals/range` (R6
 * additive endpoint) and compares each day's protein-grams to the
 * `LifestyleTarget` row keyed "protein_g" (or a default ≥ 130g).
 */

import { useMemo } from "react";
import { LifestyleShell } from "./LifestyleShell";
import { Reenie, Archivo } from "./typography";
import type { DailyProteinPoint, LifestyleTargetLite } from "./types";

const W = 348;
const H = 86;
const PAD_T = 4;
const PAD_B = 12;
const PAD_L = 22;
const PAD_R = 4;

export function ProteinHitCard({
  dailyProtein,
  lifestyleTargets = [],
  durationWeeks = 16,
  programStartDate,
  tilt = -0.3,
}: {
  /** Daily protein totals from /api/nutrition/meals/range. */
  dailyProtein: DailyProteinPoint[];
  /** Optional LifestyleTarget rows; "protein_g" drives the daily threshold. */
  lifestyleTargets?: LifestyleTargetLite[];
  durationWeeks?: number;
  programStartDate: string | null;
  tilt?: number;
}) {
  const proteinTarget = lifestyleTargets.find((t) => t.key === "protein_g");
  const targetGrams = proteinTarget?.value ?? 130;

  const cells = useMemo(
    () => buildDailyAdherenceGrid(dailyProtein, programStartDate, durationWeeks, targetGrams),
    [dailyProtein, programStartDate, durationWeeks, targetGrams],
  );

  const completed = cells.filter((c) => c.state === "hit" || c.state === "miss");
  const hits = cells.filter((c) => c.state === "hit").length;
  const adherence = completed.length ? Math.round((hits / completed.length) * 100) : 0;
  const tone: "red" | "yellow" | "green" =
    adherence >= 85 ? "green" : adherence >= 70 ? "yellow" : "red";
  const status = tone === "green" ? "STRONG" : tone === "yellow" ? "SLIPPING" : "BEHIND";

  let streak = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].state === "hit") streak++;
    else if (cells[i].state === "future" || cells[i].state === "today-pending") continue;
    else break;
  }

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const cellW = innerW / durationWeeks;
  const cellH = innerH / 7;
  const cellPad = 0.8;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Re-shape cells (flat array of weeks*7) into a [week][dow] grid for SVG.
  const grid: GridCell[][] = [];
  for (let w = 0; w < durationWeeks; w++) {
    const week: GridCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(cells[w * 7 + d] ?? { state: "future" });
    }
    grid.push(week);
  }

  return (
    <LifestyleShell
      name="PROTEIN HIT"
      icon="protein"
      tone={tone}
      tilt={tilt}
      kicker={`DAILY PROTEIN · TARGET ≥ ${Math.round(targetGrams)}G`}
      statusLabel={status}
      hero={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: "rgb(var(--ft-text-primary))", lineHeight: 0.85 }}>
            {adherence}
            <span style={{ fontSize: 28 }}>%</span>
          </Reenie>
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".14em" }}>
            {hits}/{completed.length} DAYS HIT
          </Archivo>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <Archivo
              size={8}
              color="rgb(var(--ft-text-tertiary))"
              style={{ letterSpacing: ".14em", display: "block" }}
            >
              STREAK
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
              {streak}D
            </Archivo>
          </div>
        </div>
      }
      chart={
        <svg width={W} height={H} aria-hidden style={{ display: "block" }}>
          {dayLabels.map((dl, i) => (
            <text
              key={i}
              x={PAD_L - 4}
              y={PAD_T + cellH * (i + 0.7)}
              fontSize="7"
              fill="rgb(var(--ft-text-tertiary))"
              className="font-data"
              textAnchor="end"
              letterSpacing=".05em"
            >
              {dl}
            </text>
          ))}
          {grid.map((week, w) =>
            week.map((cell, d) => {
              const x = PAD_L + cellW * w + cellPad;
              const y = PAD_T + cellH * d + cellPad;
              const cw = cellW - cellPad * 2;
              const ch = cellH - cellPad * 2;
              let fill = "rgb(var(--ft-border-faint))";
              let stroke = "rgb(var(--ft-border-faint))";
              let opacity = 1;
              if (cell.state === "hit") {
                fill = "rgb(var(--ft-pull))";
                stroke = "rgb(var(--ft-pull))";
                opacity = 0.85;
              } else if (cell.state === "miss") {
                fill = "rgb(var(--ft-legs))";
                stroke = "rgb(var(--ft-legs))";
                opacity = 0.55;
              } else if (cell.state === "today-pending") {
                fill = "rgb(var(--ft-accent) / 0.18)";
                stroke = "rgb(var(--ft-accent))";
              }
              return (
                <rect
                  key={`${w}-${d}`}
                  x={x}
                  y={y}
                  width={cw}
                  height={ch}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth=".4"
                  opacity={opacity}
                />
              );
            }),
          )}
          {[0, 4, 8, 12, durationWeeks].map((w) => (
            <text
              key={w}
              x={PAD_L + cellW * w}
              y={H - 2}
              fontSize="7"
              fill="rgb(var(--ft-text-tertiary))"
              className="font-data"
              textAnchor="middle"
              letterSpacing=".08em"
            >
              W{w}
            </text>
          ))}
        </svg>
      }
      footer={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, background: "rgb(var(--ft-pull))", opacity: 0.85, display: "inline-block" }} />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              HIT
            </Archivo>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, background: "rgb(var(--ft-legs))", opacity: 0.55, display: "inline-block" }} />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              MISS
            </Archivo>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                border: "1px solid rgb(var(--ft-accent))",
                background: "rgb(var(--ft-accent) / 0.18)",
                display: "inline-block",
              }}
            />
            <Archivo size={8} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".10em" }}>
              TODAY
            </Archivo>
          </div>
        </div>
      }
    />
  );
}

interface GridCell {
  state: "hit" | "miss" | "future" | "today-pending";
}

/**
 * Build the 16-week × 7-day adherence grid by stamping each day's
 * protein total against the user's target. R6 — replaces the prior
 * weekly CheckIn.nutritionAdherence aggregation.
 *
 * Cell states:
 *   - hit            → grams >= target
 *   - miss           → grams < target (or no data on a past day)
 *   - future         → day is past program duration
 *   - today-pending  → today's day with no entry yet
 */
function buildDailyAdherenceGrid(
  dailyProtein: DailyProteinPoint[],
  programStart: string | null,
  durationWeeks: number,
  targetGrams: number,
): GridCell[] {
  const totalDays = durationWeeks * 7;
  const cells: GridCell[] = [];
  if (!programStart) {
    for (let i = 0; i < totalDays; i++) cells.push({ state: "future" });
    return cells;
  }
  const start = new Date(programStart).getTime();
  const todayDay = Math.floor((Date.now() - start) / 86400000);
  const byDate = new Map<string, number>();
  for (const p of dailyProtein) byDate.set(p.date, p.totalProtein);

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const grams = byDate.get(key);
    if (i > todayDay) cells.push({ state: "future" });
    else if (i === todayDay && (grams == null || grams === 0)) cells.push({ state: "today-pending" });
    else if (grams != null && grams >= targetGrams) cells.push({ state: "hit" });
    else cells.push({ state: "miss" });
  }
  return cells;
}
