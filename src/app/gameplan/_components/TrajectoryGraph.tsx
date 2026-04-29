"use client";

/**
 * Full-size trajectory graph — rendered inside `TrajectoryModal`.
 *
 * Verbatim port of gameplan-active.jsx#TrajectoryGraph (lines 642–901):
 *   - 4-tick y-axis with grid lines
 *   - block-boundary verticals every 4 weeks
 *   - variance band (hatched) ± `variancePct` around expected
 *   - dashed expected line
 *   - today vertical marker + label
 *   - solid rolling-7 line (color via `tone`)
 *   - daily dots (faded)
 *   - endpoint marker on actual + goal endpoint glyph
 *   - x-axis week labels (W0/W4/W8/W12/W16)
 *   - hover/touch crosshair with date readout
 *   - drift readout: 7-DAY AVG vs VS EXPECTED ± delta + AHEAD/BEHIND PILL
 *   - legend (7-DAY AVG / EXPECTED / ±band)
 */

import { useMemo, useRef, useState } from "react";
import { buildSeries, isAheadOf, type SeriesInput } from "./seriesUtil";
import { Marker, Reenie, Archivo } from "./typography";

export function TrajectoryGraph({
  series,
  variancePct = 0.025,
  decimals = 1,
}: {
  series: SeriesInput;
  variancePct?: number;
  decimals?: number;
}) {
  const built = useMemo(() => buildSeries(series), [series]);
  const { daily, rolling7, expected, currentDay, totalDays } = built;
  const unit = series.unit ?? "";

  const W = 348;
  const H = 220;
  const padL = 32;
  const padR = 12;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Y range — combine actual + expected + variance band.
  const allValues = [...rolling7, ...expected, ...daily];
  let yMin = Math.min(...allValues);
  let yMax = Math.max(...allValues);
  const yPad = (yMax - yMin) * 0.15 || 1;
  yMin -= yPad;
  yMax += yPad;
  const ySpan = yMax - yMin;

  const xAt = (day: number) => padL + (day / totalDays) * innerW;
  const yAt = (val: number) => padT + (1 - (val - yMin) / ySpan) * innerH;

  // Build paths.
  const expectedPath = expected
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");
  const rollingPath = rolling7
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");

  // Variance band — above + below expected.
  const bandTopPath = expected
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v * (1 + variancePct)).toFixed(1)}`)
    .join(" ");
  const bandBotPath = expected
    .map((v, i) => `L ${xAt(i).toFixed(1)} ${yAt(v * (1 - variancePct)).toFixed(1)}`)
    .reverse()
    .join(" ");
  const bandFillPath = `${bandTopPath} ${bandBotPath} Z`;

  // Drift readout.
  const currentActual = rolling7[currentDay];
  const currentExpected = expected[currentDay];
  const ahead = isAheadOf(currentActual, currentExpected, series.target, series.start);
  const lineColor = ahead ? "rgb(var(--ft-pull))" : "rgb(var(--ft-legs))";
  const delta = currentActual - currentExpected;
  const deltaSign = delta >= 0 ? "+" : "−";
  const deltaAbs = Math.abs(delta).toFixed(decimals);

  // Hover state.
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function dayFromClientX(clientX: number): number | null {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = clientX - rect.left;
    const x = (cx / rect.width) * W;
    if (x < padL || x > W - padR) return null;
    const day = Math.round(((x - padL) / innerW) * totalDays);
    return Math.max(0, Math.min(totalDays, day));
  }

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    setHover(dayFromClientX(e.clientX));
  }
  function handleLeave() {
    setHover(null);
  }
  function handleTouch(e: React.TouchEvent<SVGSVGElement>) {
    const t = e.touches[0] || e.changedTouches[0];
    if (!t) return;
    setHover(dayFromClientX(t.clientX));
  }

  // Hover values.
  const hoverDay = hover ?? currentDay;
  const hoverIsLogged = hoverDay <= currentDay;
  const hoverActual = hoverIsLogged ? rolling7[hoverDay] : null;
  const hoverExpected = expected[hoverDay];
  const hoverDate = `WEEK ${Math.floor(hoverDay / 7) + 1} · DAY ${(hoverDay % 7) + 1}`;

  // Y-axis ticks (4).
  const ticks: { y: number; v: number }[] = [];
  for (let i = 0; i <= 3; i++) {
    const v = yMin + (ySpan * i) / 3;
    ticks.push({ y: yAt(v), v });
  }

  return (
    <div>
      {/* Drift readout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
          >
            {hoverIsLogged ? "7-DAY AVG" : "PROJECTED"}
          </Archivo>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 1 }}>
            <Reenie style={{ fontSize: 42, color: "rgb(var(--ft-text-primary))" }}>
              {hoverIsLogged && hoverActual != null ? hoverActual.toFixed(decimals) : "—"}
            </Reenie>
            <Archivo size={10} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
              {unit}
            </Archivo>
          </div>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".15em", marginTop: 2, display: "block", textTransform: "uppercase" }}
          >
            {hoverDate}
          </Archivo>
        </div>
        <div style={{ textAlign: "right" }}>
          <Archivo
            size={8}
            color="rgb(var(--ft-text-tertiary))"
            style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
          >
            VS EXPECTED
          </Archivo>
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 4,
              marginTop: 2,
              padding: "3px 9px",
              border: `1.5px solid ${lineColor}`,
              background: ahead ? "rgb(var(--ft-pull) / 0.10)" : "rgb(var(--ft-legs) / 0.10)",
            }}
          >
            <Reenie style={{ fontSize: 28, color: lineColor, lineHeight: 1 }}>
              {deltaSign}
              {deltaAbs}
            </Reenie>
            <Archivo size={9} color={lineColor} style={{ letterSpacing: ".12em" }}>
              {unit}
            </Archivo>
          </div>
          <Archivo
            size={9}
            color={lineColor}
            style={{ display: "block", marginTop: 4, letterSpacing: ".18em", textTransform: "uppercase" }}
          >
            {ahead ? "AHEAD OF PLAN" : "BEHIND PLAN"}
          </Archivo>
        </div>
      </div>

      {/* SVG graph */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", cursor: "crosshair", touchAction: "none" }}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleLeave}
      >
        <defs>
          <pattern
            id="bandHatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgb(var(--ft-info-fg))" strokeWidth="1" opacity=".22" />
          </pattern>
          <filter id="drawSpray" x="-2%" y="-2%" width="104%" height="104%">
            <feGaussianBlur stdDeviation=".3" />
          </filter>
        </defs>

        {/* Grid lines + Y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={t.y}
              x2={W - padR}
              y2={t.y}
              stroke="rgb(var(--ft-border-faint))"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <text
              x={padL - 6}
              y={t.y + 3}
              textAnchor="end"
              fontSize="8"
              fill="rgb(var(--ft-text-tertiary))"
              className="font-data"
              letterSpacing=".10em"
            >
              {t.v.toFixed(decimals)}
            </text>
          </g>
        ))}

        {/* Block boundaries (every 4 weeks) */}
        {[28, 56, 84].map((d) => (
          <line
            key={d}
            x1={xAt(d)}
            y1={padT}
            x2={xAt(d)}
            y2={H - padB}
            stroke="rgb(var(--ft-border-faint))"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        ))}

        {/* Variance band */}
        <path d={bandFillPath} fill="url(#bandHatch)" stroke="none" />
        <path d={bandFillPath} fill="rgb(var(--ft-info-fg) / 0.06)" stroke="none" />

        {/* Expected line */}
        <path
          d={expectedPath}
          fill="none"
          stroke="rgb(var(--ft-info-fg))"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity=".7"
        />

        {/* Today vertical marker */}
        <line
          x1={xAt(currentDay)}
          y1={padT}
          x2={xAt(currentDay)}
          y2={H - padB}
          stroke="rgb(var(--ft-accent))"
          strokeWidth="1.5"
          opacity=".55"
        />
        <text
          x={xAt(currentDay)}
          y={padT - 3}
          textAnchor="middle"
          fontSize="8"
          fill="rgb(var(--ft-accent))"
          className="font-data"
          letterSpacing=".15em"
        >
          TODAY
        </text>

        {/* Rolling avg line — wobbly via filter */}
        <path
          d={rollingPath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#drawSpray)"
        />
        <path
          d={rollingPath}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".6"
        />

        {/* Daily dots */}
        {daily.map((v, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(v)} r="1.1" fill={lineColor} opacity=".30" />
        ))}

        {/* Endpoint marker on actual */}
        <circle
          cx={xAt(currentDay)}
          cy={yAt(rolling7[currentDay])}
          r="4.5"
          fill="rgb(var(--ft-bg))"
          stroke={lineColor}
          strokeWidth="2"
        />

        {/* Goal endpoint marker */}
        <g>
          <line
            x1={xAt(totalDays)}
            y1={yAt(series.target) - 8}
            x2={xAt(totalDays)}
            y2={yAt(series.target) + 8}
            stroke="rgb(var(--ft-accent))"
            strokeWidth="2"
          />
          <line
            x1={xAt(totalDays) - 6}
            y1={yAt(series.target)}
            x2={xAt(totalDays) + 0}
            y2={yAt(series.target)}
            stroke="rgb(var(--ft-accent))"
            strokeWidth="2"
          />
          <text
            x={xAt(totalDays)}
            y={yAt(series.target) - 12}
            textAnchor="end"
            fontSize="8"
            fill="rgb(var(--ft-accent))"
            className="font-data"
            letterSpacing=".15em"
          >
            GOAL
          </text>
        </g>

        {/* X-axis week labels */}
        {[0, 4, 8, 12, 16].map((w) => (
          <text
            key={w}
            x={xAt(w * 7)}
            y={H - padB + 14}
            textAnchor="middle"
            fontSize="8"
            fill="rgb(var(--ft-text-tertiary))"
            className="font-data"
            letterSpacing=".10em"
          >
            W{w}
          </text>
        ))}

        {/* Hover crosshair */}
        {hover != null && (
          <g>
            <line
              x1={xAt(hover)}
              y1={padT}
              x2={xAt(hover)}
              y2={H - padB}
              stroke="rgb(var(--ft-border-strong))"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            {hoverIsLogged && hoverActual != null && (
              <circle
                cx={xAt(hover)}
                cy={yAt(hoverActual)}
                r="3.5"
                fill={lineColor}
                stroke="rgb(var(--ft-bg))"
                strokeWidth="1.5"
              />
            )}
            <circle
              cx={xAt(hover)}
              cy={yAt(hoverExpected)}
              r="2.5"
              fill="rgb(var(--ft-info-fg))"
              stroke="rgb(var(--ft-bg))"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Marker style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{ width: 18, height: 2.5, background: lineColor, borderRadius: 2, display: "inline-block" }}
          />
          <Archivo size={8} color="rgb(var(--ft-text-secondary))" style={{ letterSpacing: ".12em" }}>
            7-DAY AVG
          </Archivo>
        </Marker>
        <Marker style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width="18" height="3" aria-hidden>
            <line x1="0" y1="1.5" x2="18" y2="1.5" stroke="rgb(var(--ft-info-fg))" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
          <Archivo size={8} color="rgb(var(--ft-text-secondary))" style={{ letterSpacing: ".12em" }}>
            EXPECTED
          </Archivo>
        </Marker>
        <Marker style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 18,
              height: 8,
              background: "rgb(var(--ft-info-bg))",
              border: "1px solid rgb(var(--ft-info-border))",
              display: "inline-block",
            }}
          />
          <Archivo size={8} color="rgb(var(--ft-text-secondary))" style={{ letterSpacing: ".12em" }}>
            ±{(variancePct * 100).toFixed(1)}% BAND
          </Archivo>
        </Marker>
      </div>
    </div>
  );
}
