"use client";

/**
 * Protein-hit card — prototype 16-week × 7-day grid adapted to live data.
 *
 * **Schema gap (flagged for R6)**: gameplan-active.jsx#ProteinHitCard
 * (lines 1838–1987) renders a daily hit/miss calendar (16 weeks × 7
 * days = 112 cells). Live data exposes `CheckIn.nutritionAdherence`
 * (weekly 0-100 %), not per-day hit/miss. R6 needs either a
 * multi-date meals roll-up endpoint or a Goal Engine adherence cache.
 *
 * Until then we render the 16-cell weekly row colored by adherence
 * tier (≥85% green / ≥70% yellow / <70% red). Days 1-7 of each cell
 * are stretched to fill the column. Today's-pending cell is the
 * trailing column of the current week.
 */

import { useMemo } from "react";
import { LifestyleShell } from "./LifestyleShell";
import { Reenie, Archivo } from "./typography";
import type { CheckIn } from "./types";

const W = 348;
const H = 86;
const PAD_T = 4;
const PAD_B = 12;
const PAD_L = 22;
const PAD_R = 4;

export function ProteinHitCard({
  recentCheckIns,
  durationWeeks = 16,
  programStartDate,
  tilt = -0.3,
}: {
  recentCheckIns: CheckIn[];
  durationWeeks?: number;
  programStartDate: string | null;
  tilt?: number;
}) {
  const cells = useMemo(
    () => buildAdherenceRow(recentCheckIns, programStartDate, durationWeeks),
    [recentCheckIns, programStartDate, durationWeeks],
  );

  const completed = cells.filter((c) => c.state === "hit" || c.state === "partial" || c.state === "miss");
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
  const cellPad = 1.2;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <LifestyleShell
      name="PROTEIN HIT"
      icon="protein"
      tone={tone}
      tilt={tilt}
      kicker="WEEKLY NUTRITION ADHERENCE · DERIVED FROM CHECK-INS"
      statusLabel={status}
      hero={
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <Reenie style={{ fontSize: 44, color: "rgb(var(--ft-text-primary))", lineHeight: 0.85 }}>
            {adherence}
            <span style={{ fontSize: 28 }}>%</span>
          </Reenie>
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".14em" }}>
            {hits}/{completed.length} WEEKS HIT
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
              {streak}W
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
          {cells.map((cell, w) => {
            const x = PAD_L + cellW * w + cellPad;
            const cw = cellW - cellPad * 2;
            const ch = cellH - cellPad * 2;
            let fill = "rgb(var(--ft-border-faint))";
            let stroke = "rgb(var(--ft-border-faint))";
            let opacity = 1;
            if (cell.state === "hit") {
              fill = "rgb(var(--ft-pull))";
              stroke = "rgb(var(--ft-pull))";
              opacity = 0.85;
            } else if (cell.state === "partial") {
              fill = "rgb(var(--ft-core))";
              stroke = "rgb(var(--ft-core))";
              opacity = 0.7;
            } else if (cell.state === "miss") {
              fill = "rgb(var(--ft-legs))";
              stroke = "rgb(var(--ft-legs))";
              opacity = 0.55;
            } else if (cell.state === "today-pending") {
              fill = "rgb(var(--ft-accent) / 0.18)";
              stroke = "rgb(var(--ft-accent))";
            }
            // Render the whole 7-day column as one tall rect since we
            // only have weekly granularity; flagged for R6.
            return (
              <rect
                key={w}
                x={x}
                y={PAD_T + cellPad}
                width={cw}
                height={ch * 7 - cellPad * 2}
                fill={fill}
                stroke={stroke}
                strokeWidth=".6"
                opacity={opacity}
              />
            );
          })}
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

interface AdherenceCell {
  weekIndex: number;
  state: "hit" | "partial" | "miss" | "future" | "today-pending";
}

/**
 * Reduce weekly `CheckIn.nutritionAdherence` to per-week cell states.
 * ≥85% → hit, 70-84% → partial, <70% → miss, no data → future,
 * current ISO-week with no entry yet → today-pending.
 *
 * **R6**: replace with daily meal roll-ups for true 16-week × 7-day grid.
 */
function buildAdherenceRow(
  checkIns: CheckIn[],
  programStart: string | null,
  durationWeeks: number,
): AdherenceCell[] {
  if (!programStart) {
    return Array.from({ length: durationWeeks }, (_, i) => ({ weekIndex: i, state: "future" as const }));
  }
  const start = new Date(programStart).getTime();
  const cells: AdherenceCell[] = [];
  const todayWeek = Math.floor((Date.now() - start) / (7 * 86400000));
  for (let w = 0; w < durationWeeks; w++) {
    const weekStart = start + w * 7 * 86400000;
    const weekEnd = weekStart + 7 * 86400000;
    const ci = checkIns.find((c) => {
      const t = new Date(c.date).getTime();
      return t >= weekStart && t < weekEnd;
    });
    if (!ci || ci.nutritionAdherence == null) {
      if (w === todayWeek) cells.push({ weekIndex: w, state: "today-pending" });
      else if (w < todayWeek) cells.push({ weekIndex: w, state: "miss" });
      else cells.push({ weekIndex: w, state: "future" });
      continue;
    }
    const a = ci.nutritionAdherence;
    if (a >= 85) cells.push({ weekIndex: w, state: "hit" });
    else if (a >= 70) cells.push({ weekIndex: w, state: "partial" });
    else cells.push({ weekIndex: w, state: "miss" });
  }
  return cells;
}
