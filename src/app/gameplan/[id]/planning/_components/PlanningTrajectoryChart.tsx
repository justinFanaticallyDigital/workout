"use client";

/**
 * Trajectory chart — verbatim port of planning-screens.jsx
 * #TrajectoryChart (lines 671–798): grid bg, axes, feasibility band,
 * TODAY line, block boundary markers, original line dashed, draft
 * line solid, actuals dots, legend.
 *
 * Distinct from R5 dashboard `TrajectoryGraph` (which adds hover
 * crosshair + drift readout). The planning chart is read-only and
 * focused on showing the original-vs-draft delta.
 */

interface ChartProps {
  /** Body-weight series in lb. */
  startWeight: number;
  targetOriginal: number;
  targetDraft: number;
  weeksOriginal: number;
  weeksDraft: number;
  /** Historical actuals: array of [weekIndex, weight]. */
  actuals: Array<[number, number]>;
  /** Block boundary labels, e.g. [{ wk: 4, label: "B2 INTENS" }, ...]. */
  boundaries: Array<{ wk: number; label: string }>;
  /** Today's week index (0-based). */
  todayWeek: number;
}

const W = 332;
const H = 170;
const PAD_L = 30;
const PAD_R = 10;
const PAD_T = 14;
const PAD_B = 22;

export function PlanningTrajectoryChart({
  startWeight,
  targetOriginal,
  targetDraft,
  weeksOriginal,
  weeksDraft,
  actuals,
  boundaries,
  todayWeek,
}: ChartProps) {
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  // Y range — pad ±2 around start/target.
  const allY = [startWeight, targetOriginal, targetDraft, ...actuals.map((a) => a[1])];
  const yMin = Math.floor(Math.min(...allY)) - 2;
  const yMax = Math.ceil(Math.max(...allY)) + 2;
  const ySpan = yMax - yMin;

  const x = (w: number, total: number) => PAD_L + (w / total) * innerW;
  const y = (lb: number) => PAD_T + (1 - (lb - yMin) / ySpan) * innerH;

  // Build paths.
  const origPts = Array.from({ length: weeksOriginal + 1 }, (_, i) => [
    i,
    startWeight - (i / weeksOriginal) * (startWeight - targetOriginal),
  ] as [number, number]);
  const draftPts: Array<[number, number]> = [];
  for (let i = 0; i <= weeksDraft; i++) {
    draftPts.push([i, startWeight - (i / weeksDraft) * (startWeight - targetDraft)]);
  }
  const pathFromPts = (pts: Array<[number, number]>, total: number) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(p[0], total)},${y(p[1])}`).join(" ");

  // Feasibility band: ±0.6lb around the draft line.
  const bandUpper = draftPts.map(([w, lb]) => [w, lb + 0.6] as [number, number]);
  const bandLower = draftPts.map(([w, lb]) => [w, lb - 0.6] as [number, number]);
  const bandPath = `${bandUpper
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p[0], weeksDraft)},${y(p[1])}`)
    .join(" ")} ${bandLower
    .slice()
    .reverse()
    .map((p) => `L${x(p[0], weeksDraft)},${y(p[1])}`)
    .join(" ")} Z`;

  // Y label set: 5 evenly spaced.
  const yLabels: number[] = [];
  for (let v = Math.ceil(yMin / 5) * 5; v < yMax; v += 5) yLabels.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      <defs>
        <pattern id="bpgrid" x="0" y="0" width="20" height="14" patternUnits="userSpaceOnUse">
          <path
            d="M0 0 H20 M0 0 V14"
            stroke="rgb(var(--ft-border-faint))"
            strokeWidth=".5"
          />
        </pattern>
      </defs>
      <rect x={PAD_L} y={PAD_T} width={innerW} height={innerH} fill="url(#bpgrid)" />
      <line
        x1={PAD_L}
        y1={PAD_T}
        x2={PAD_L}
        y2={PAD_T + innerH}
        stroke="rgb(var(--ft-text-secondary))"
        strokeWidth=".7"
      />
      <line
        x1={PAD_L}
        y1={PAD_T + innerH}
        x2={PAD_L + innerW}
        y2={PAD_T + innerH}
        stroke="rgb(var(--ft-text-secondary))"
        strokeWidth=".7"
      />

      {yLabels.map((lb) => (
        <g key={lb}>
          <line
            x1={PAD_L - 3}
            x2={PAD_L}
            y1={y(lb)}
            y2={y(lb)}
            stroke="rgb(var(--ft-text-tertiary))"
            strokeWidth=".5"
          />
          <text
            x={PAD_L - 5}
            y={y(lb) + 3}
            textAnchor="end"
            fontSize="7"
            fill="rgb(var(--ft-text-secondary))"
            className="font-body"
          >
            {lb}
          </text>
        </g>
      ))}
      {[0, Math.floor(weeksDraft / 4), Math.floor(weeksDraft / 2), weeksDraft]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((wk) => (
          <g key={wk}>
            <line
              x1={x(wk, weeksDraft)}
              x2={x(wk, weeksDraft)}
              y1={PAD_T + innerH}
              y2={PAD_T + innerH + 3}
              stroke="rgb(var(--ft-text-tertiary))"
              strokeWidth=".5"
            />
            <text
              x={x(wk, weeksDraft)}
              y={PAD_T + innerH + 12}
              textAnchor="middle"
              fontSize="7"
              fill="rgb(var(--ft-text-secondary))"
              className="font-body"
            >
              W{wk}
            </text>
          </g>
        ))}

      {/* feasibility band */}
      <path d={bandPath} fill="rgb(var(--ft-pull) / 0.18)" stroke="none" />

      {/* TODAY line */}
      <line
        x1={x(todayWeek, weeksDraft)}
        x2={x(todayWeek, weeksDraft)}
        y1={PAD_T}
        y2={PAD_T + innerH}
        stroke="rgb(var(--ft-accent))"
        strokeWidth=".7"
        strokeDasharray="2 3"
        opacity=".8"
      />
      <text
        x={x(todayWeek, weeksDraft) + 3}
        y={PAD_T + 8}
        fontSize="7"
        fill="rgb(var(--ft-accent))"
        className="font-body"
      >
        TODAY · W{todayWeek}
      </text>

      {/* block boundary markers */}
      {boundaries.map((b) => (
        <g key={b.wk}>
          <line
            x1={x(b.wk, weeksDraft)}
            x2={x(b.wk, weeksDraft)}
            y1={PAD_T}
            y2={PAD_T + innerH}
            stroke="rgb(var(--ft-text-tertiary))"
            strokeWidth=".5"
            strokeDasharray="1 2"
            opacity=".5"
          />
          <text
            x={x(b.wk, weeksDraft)}
            y={PAD_T - 4}
            fontSize="6"
            fill="rgb(var(--ft-text-tertiary))"
            textAnchor="middle"
            className="font-body"
          >
            {b.label}
          </text>
        </g>
      ))}

      {/* Original line — dashed */}
      <path
        d={pathFromPts(origPts, weeksOriginal)}
        fill="none"
        stroke="rgb(var(--ft-text-secondary))"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity=".6"
      />

      {/* Draft line — solid accent */}
      <path
        d={pathFromPts(draftPts, weeksDraft)}
        fill="none"
        stroke="rgb(var(--ft-accent))"
        strokeWidth="2"
      />
      <circle
        cx={x(weeksDraft, weeksDraft)}
        cy={y(targetDraft)}
        r="3"
        fill="rgb(var(--ft-accent))"
        stroke="rgb(var(--ft-text-primary))"
        strokeWidth=".8"
      />

      {/* Actuals dots + connecting line */}
      {actuals.map((p, i) => (
        <circle
          key={i}
          cx={x(p[0], weeksDraft)}
          cy={y(p[1])}
          r="1.8"
          fill="rgb(var(--ft-text-primary))"
        />
      ))}
      {actuals.length > 1 && (
        <path
          d={actuals
            .map((p, i) => `${i === 0 ? "M" : "L"}${x(p[0], weeksDraft)},${y(p[1])}`)
            .join(" ")}
          fill="none"
          stroke="rgb(var(--ft-text-primary))"
          strokeWidth=".8"
          opacity=".85"
        />
      )}

      {/* Legend box */}
      <g transform={`translate(${PAD_L + 4}, ${PAD_T + 4})`}>
        <rect
          x="0"
          y="0"
          width="98"
          height="32"
          fill="rgb(var(--ft-surface))"
          stroke="rgb(var(--ft-border))"
          strokeWidth=".5"
          opacity=".9"
        />
        <line x1="4" y1="8" x2="14" y2="8" stroke="rgb(var(--ft-text-secondary))" strokeWidth="1" strokeDasharray="3 2" />
        <text x="17" y="10" fontSize="7" fill="rgb(var(--ft-text-primary))" className="font-body">
          ORIGINAL
        </text>
        <line x1="4" y1="17" x2="14" y2="17" stroke="rgb(var(--ft-accent))" strokeWidth="1.5" />
        <text x="17" y="19" fontSize="7" fill="rgb(var(--ft-text-primary))" className="font-body">
          DRAFT
        </text>
        <circle cx="9" cy="26" r="1.5" fill="rgb(var(--ft-text-primary))" />
        <text x="17" y="28" fontSize="7" fill="rgb(var(--ft-text-primary))" className="font-body">
          ACTUAL
        </text>
      </g>
    </svg>
  );
}
