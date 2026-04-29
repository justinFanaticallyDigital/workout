"use client";

/**
 * Body weight projection chart — current → target over weeks with a
 * recommended-band polygon and an in/above/below-band verdict.
 *
 * Verbatim port of picker-screens.jsx#BodyWeightChart (lines 1022–1125).
 * Renders as a small SVG line chart with:
 *   - axis grid + dashed midlines
 *   - recommended-band polygon (success-tinted)
 *   - projected line from current → target (color = verdict)
 *   - axis ticks (WK 0 / WK N / LB)
 *   - rate readout + status pill below the chart
 *   - advisory banner when out-of-band
 *
 * Verdict colors use R0 state tokens:
 *   - in band      → success
 *   - too fast     → danger
 *   - too slow     → warn
 */

const W = 320;

interface ChartProps {
  /** Starting body weight (lb). */
  start: number;
  /** Target body weight (lb). */
  target: number;
  /** Program duration in weeks. */
  weeks: number;
  /** Optional pixel height of the chart area; default 90. */
  height?: number;
}

export function BodyWeightChart({ start, target, weeks, height = 90 }: ChartProps) {
  const padL = 28;
  const padR = 10;
  const padT = 8;
  const padB = 18;
  const innerW = W - padL - padR;
  const innerH = height - padT - padB;

  const totalDelta = target - start;
  const ratePerWk = weeks > 0 ? totalDelta / weeks : 0;

  // Recommended ranges: lean gain 0.25–0.75 lb/wk; cut −1.0–−0.25 lb/wk.
  const recMax = totalDelta >= 0 ? 0.75 : -0.25;
  const recMin = totalDelta >= 0 ? 0.25 : -1.0;

  const inBand =
    totalDelta >= 0
      ? ratePerWk >= recMin && ratePerWk <= recMax
      : ratePerWk <= recMin && ratePerWk >= recMax;
  const tooFast = totalDelta >= 0 ? ratePerWk > recMax : ratePerWk < recMax;
  const status = inBand ? "SUSTAINABLE" : tooFast ? "TOO AGGRESSIVE" : "VERY GRADUAL";
  const colorVar = inBand
    ? "rgb(var(--ft-success-fg))"
    : tooFast
    ? "rgb(var(--ft-danger-fg))"
    : "rgb(var(--ft-warn-fg))";

  // Y range — pad ±2 lb around min/max of (start, target, recBand projection).
  const recEndHi = start + recMax * weeks;
  const recEndLo = start + recMin * weeks;
  const yMin = Math.min(start, target, recEndHi, recEndLo) - 1.5;
  const yMax = Math.max(start, target, recEndHi, recEndLo) + 1.5;
  const ySpan = yMax - yMin || 1;

  const xAt = (w: number) => padL + (weeks > 0 ? (w / weeks) * innerW : 0);
  const yAt = (lb: number) => padT + (1 - (lb - yMin) / ySpan) * innerH;

  // Recommended-band polygon path.
  const bandPath = `M ${xAt(0)} ${yAt(start)} L ${xAt(weeks)} ${yAt(recEndHi)} L ${xAt(weeks)} ${yAt(recEndLo)} L ${xAt(0)} ${yAt(start)} Z`;

  return (
    <div style={{ position: "relative", marginTop: 6 }}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: "block" }}>
        {/* Grid background */}
        <rect
          x={padL}
          y={padT}
          width={innerW}
          height={innerH}
          fill="rgb(0 0 0 / 0.18)"
          stroke="rgb(var(--ft-border-faint))"
        />
        {/* Dashed midlines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padL}
            x2={padL + innerW}
            y1={padT + innerH * t}
            y2={padT + innerH * t}
            stroke="rgb(var(--ft-border-faint))"
            strokeDasharray="2 3"
          />
        ))}
        {/* Recommended band */}
        <path
          d={bandPath}
          fill="rgb(var(--ft-success-fg) / 0.14)"
          stroke="rgb(var(--ft-success-fg) / 0.5)"
          strokeDasharray="3 3"
          strokeWidth="0.8"
        />
        <text
          x={padL + innerW - 4}
          y={yAt(recEndHi) - 3}
          textAnchor="end"
          className="font-body"
          fontSize="7"
          fill="rgb(var(--ft-success-fg) / 0.7)"
          letterSpacing=".15em"
        >
          RECOMMENDED
        </text>
        {/* Projected line */}
        <line
          x1={xAt(0)}
          y1={yAt(start)}
          x2={xAt(weeks)}
          y2={yAt(target)}
          stroke={colorVar}
          strokeWidth="1.8"
        />
        {/* Start dot + label */}
        <circle cx={xAt(0)} cy={yAt(start)} r="3" fill="rgb(var(--ft-text-primary))" />
        <text
          x={xAt(0) - 4}
          y={yAt(start) + 3}
          textAnchor="end"
          className="font-data tabular-nums"
          fontSize="11"
          fill="rgb(var(--ft-text-primary))"
        >
          {start}
        </text>
        {/* Target dot + label */}
        <circle cx={xAt(weeks)} cy={yAt(target)} r="3" fill={colorVar} />
        <text
          x={xAt(weeks) + 4}
          y={yAt(target) + 3}
          className="font-data tabular-nums"
          fontSize="11"
          fill={colorVar}
        >
          {target}
        </text>
        {/* Axis ticks */}
        <text
          x={padL}
          y={height - 4}
          className="font-body"
          fontSize="7"
          fill="rgb(var(--ft-text-tertiary))"
          letterSpacing=".2em"
        >
          WK 0
        </text>
        <text
          x={padL + innerW}
          y={height - 4}
          textAnchor="end"
          className="font-body"
          fontSize="7"
          fill="rgb(var(--ft-text-tertiary))"
          letterSpacing=".2em"
        >
          WK {weeks}
        </text>
        <text
          x={padL - 4}
          y={padT + 6}
          textAnchor="end"
          className="font-body"
          fontSize="7"
          fill="rgb(var(--ft-text-tertiary))"
          letterSpacing=".15em"
        >
          LB
        </text>
      </svg>

      {/* Legend / verdict */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            className="font-data tabular-nums"
            style={{ fontSize: 18, color: colorVar }}
          >
            {ratePerWk >= 0 ? "+" : ""}
            {ratePerWk.toFixed(2)}
          </span>
          <span
            className="font-body"
            style={{
              fontSize: 9,
              color: "rgb(var(--ft-text-tertiary))",
              letterSpacing: ".18em",
            }}
          >
            LB / WK
          </span>
        </div>
        <div
          className="font-body"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            border: `1px solid ${colorVar}`,
            background: `${colorVar}`,
            backgroundColor: "transparent",
            color: colorVar,
            fontSize: 9,
            letterSpacing: ".22em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: colorVar,
              display: "inline-block",
            }}
          />
          {status}
        </div>
      </div>
      {!inBand && (
        <div
          className="font-body"
          style={{
            marginTop: 5,
            padding: "5px 8px",
            background: `${colorVar}`,
            backgroundColor: "transparent",
            borderLeft: `2px solid ${colorVar}`,
            fontSize: 10,
            color: "rgb(var(--ft-text-primary))",
            lineHeight: 1.4,
          }}
        >
          {tooFast
            ? `Above the recommended ${recMin.toFixed(2)}–${recMax.toFixed(2)} lb/wk band. Extend timeline to stay lean.`
            : `Below recommended pace — slower than necessary. Tighten the deadline if you want results sooner.`}
        </div>
      )}
    </div>
  );
}
