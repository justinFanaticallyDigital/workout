"use client";

import { IconWeight, IconBarbell, IconFlame, IconMoon } from "./icons";

/**
 * Tiny projection chart (current line vs target). Used inside
 * recommendation card body to make "X behind target" visible.
 * Currently renders empty-state shell — needs goal projections (R6 + R8).
 */
export function ProjectionMini({
  width = 100,
  height = 38,
  currentSeries,
  targetSeries,
}: {
  width?: number;
  height?: number;
  currentSeries: number[] | null;
  targetSeries: number[] | null;
}) {
  if (!currentSeries || !targetSeries || currentSeries.length === 0) {
    return (
      <svg width={width} height={height} style={{ display: "block" }}>
        <rect x="0.5" y="0.5" width={width - 1} height={height - 1}
          fill="none"
          stroke="rgb(var(--ft-border) / 0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={width / 2}
          y={height / 2 + 3}
          textAnchor="middle"
          fontFamily="var(--ft-font-data)"
          fontSize="9"
          fill="rgb(var(--ft-dim))"
        >
          —
        </text>
      </svg>
    );
  }
  const all = [...currentSeries, ...targetSeries];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const xAt = (i: number, n: number) => (i / (n - 1)) * (width - 2) + 1;
  const yAt = (v: number) => height - 2 - ((v - min) / span) * (height - 4);
  const cur = currentSeries
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i, currentSeries.length).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");
  const tgt = targetSeries
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i, targetSeries.length).toFixed(1)} ${yAt(v).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={tgt} fill="none" stroke="rgb(var(--ft-success-fg))" strokeWidth="1.2" strokeDasharray="2 2" opacity=".7" />
      <path d={cur} fill="none" stroke="rgb(var(--ft-danger-fg))" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xAt(currentSeries.length - 1, currentSeries.length)} cy={yAt(currentSeries[currentSeries.length - 1])}
        r="2.2" fill="rgb(var(--ft-surface))" stroke="rgb(var(--ft-danger-fg))" strokeWidth="1.3" />
      <circle cx={xAt(targetSeries.length - 1, targetSeries.length)} cy={yAt(targetSeries[targetSeries.length - 1])}
        r="1.8" fill="rgb(var(--ft-success-fg))" />
    </svg>
  );
}

/** Days-into-block progress bar. */
export function GameplanProgressBar({
  daysIn = 52,
  totalDays = 112,
}: {
  daysIn?: number;
  totalDays?: number;
}) {
  const pct = (daysIn / totalDays) * 100;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span className="font-data" style={{ fontSize: 8.5, fontWeight: 600, color: "rgb(var(--ft-dim))", letterSpacing: ".10em" }}>W1</span>
        <span className="font-data" style={{ fontSize: 8.5, fontWeight: 600, color: "rgb(var(--ft-dim))", letterSpacing: ".10em" }}>
          NOW · W{Math.ceil(daysIn / 7)}
        </span>
        <span className="font-data" style={{ fontSize: 8.5, fontWeight: 600, color: "rgb(var(--ft-dim))", letterSpacing: ".10em" }}>
          W{Math.ceil(totalDays / 7)}
        </span>
      </div>
      <div style={{
        height: 6, background: "rgb(var(--ft-bg-alt))",
        border: "1px solid rgb(var(--ft-border-faint))", borderRadius: 1, position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: `${pct}%`, background: "rgb(var(--ft-accent))",
        }} />
        <div style={{
          position: "absolute", top: -2, bottom: -2, left: `${pct}%`,
          width: 1.5, background: "rgb(var(--ft-text-primary))",
        }} />
      </div>
    </div>
  );
}

/**
 * Engine flow diagram for the empty state — decorative only,
 * shows inputs → engine → recommendations.
 */
export function EngineFlowDiagram() {
  const inputs = [
    { Icon: IconWeight, label: "Wt" },
    { Icon: IconBarbell, label: "Sess" },
    { Icon: IconFlame, label: "Cal" },
    { Icon: IconMoon, label: "Slp" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {inputs.map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 7px",
            background: "rgb(var(--ft-bg-alt))",
            border: "1px solid rgb(var(--ft-border-faint))",
            borderRadius: 3,
          }}>
            <it.Icon size={11} color="rgb(var(--ft-text-secondary))" />
            <span className="font-data" style={{ fontSize: 9, fontWeight: 600, color: "rgb(var(--ft-text-secondary))" }}>{it.label}</span>
          </div>
        ))}
      </div>
      <svg width="20" height="80" viewBox="0 0 20 80" style={{ display: "block", flexShrink: 0 }}>
        {[10, 27, 44, 61].map((y, i) => (
          <g key={i}>
            <line x1="0" y1={y + 6} x2="14" y2={y + 6} stroke="rgb(var(--ft-dim))" strokeWidth="1" strokeDasharray="2 2" />
            <path d={`M11 ${y + 3.5} L15 ${y + 6} L11 ${y + 8.5}`} fill="none" stroke="rgb(var(--ft-dim))" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      <div style={{
        width: 70, padding: "12px 8px",
        background: "rgb(var(--ft-surface))",
        border: "1.5px solid rgb(var(--ft-accent))",
        borderRadius: 4, textAlign: "center", position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <g fill="none" stroke="rgb(var(--ft-accent))" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="3" />
              <path d="M11 4.5 V 7 M11 15 V 17.5 M4.5 11 H 7 M15 11 H 17.5 M6.4 6.4 L 8 8 M14 14 L 15.6 15.6 M6.4 15.6 L 8 14 M14 8 L 15.6 6.4" />
            </g>
          </svg>
        </div>
        <span className="font-display" style={{ fontSize: 10, fontWeight: 600, color: "rgb(var(--ft-text-primary))", display: "block", lineHeight: 1.1 }}>
          Goal Engine
        </span>
        <span className="font-data" style={{ fontSize: 8, fontWeight: 500, color: "rgb(var(--ft-dim))", display: "block", marginTop: 2, letterSpacing: ".05em" }}>
          v2.4
        </span>
      </div>
      <svg width="20" height="60" viewBox="0 0 20 60" style={{ display: "block", flexShrink: 0 }}>
        {[14, 30, 46].map((y, i) => (
          <g key={i}>
            <line x1="0" y1={y} x2="14" y2={y} stroke="rgb(var(--ft-dim))" strokeWidth="1" strokeDasharray="2 2" />
            <path d={`M11 ${y - 2.5} L15 ${y} L11 ${y + 2.5}`} fill="none" stroke="rgb(var(--ft-dim))" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {["REC 01", "REC 02", "REC 03"].map((r, i) => (
          <div key={r} style={{
            padding: "4px 8px",
            background: i === 0 ? "rgb(var(--ft-warn-bg))" : "rgb(var(--ft-surface))",
            border: `1px solid ${i === 0 ? "rgb(var(--ft-warn-border))" : "rgb(var(--ft-border-faint))"}`,
            borderRadius: 3,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <div style={{
              width: 8, height: 8,
              background: i === 0 ? "rgb(var(--ft-warn-fg))" : "rgb(var(--ft-border))",
              borderRadius: 1,
            }} />
            <span className="font-data" style={{ fontSize: 9, fontWeight: 600, color: i === 0 ? "rgb(var(--ft-warn-fg))" : "rgb(var(--ft-dim))" }}>
              {r}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 6-week trajectory chart. Renders shell only — body-weight series
 * not on CheckIn schema (R6 territory). When `checkIns` is provided,
 * dots are colored by average rating per check-in as a proxy.
 */
export function HistoryTrajectory({
  width = 360,
  height = 90,
  checkIns = [],
}: {
  width?: number;
  height?: number;
  checkIns?: Array<{ weekIdx: number; tone: "green" | "yellow" | "red"; current?: boolean }>;
}) {
  const padT = 10, padB = 20, padL = 4, padR = 4;
  const innerW = width - padL - padR;
  const xAt = (weekIdx: number) => padL + (weekIdx / 5) * innerW;
  const midY = padT + (height - padT - padB) / 2;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {/* Week dividers */}
      {[1, 2, 3, 4, 5].map((i) => (
        <line key={i}
          x1={xAt(i)} y1={padT}
          x2={xAt(i)} y2={height - padB}
          stroke="rgb(var(--ft-border-faint))"
          strokeWidth=".7"
          strokeDasharray="1 3"
        />
      ))}

      {/* Flat baseline (no body-weight series yet) */}
      <line
        x1={padL} y1={midY}
        x2={width - padR} y2={midY}
        stroke="rgb(var(--ft-border) / 0.4)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />

      {/* Check-in dots */}
      {checkIns.map((c) => {
        const color =
          c.tone === "green" ? "rgb(var(--ft-success-fg))"
          : c.tone === "yellow" ? "rgb(var(--ft-warn-fg))"
          : "rgb(var(--ft-danger-fg))";
        return (
          <g key={c.weekIdx}>
            <circle
              cx={xAt(c.weekIdx)}
              cy={midY}
              r={c.current ? 5 : 3.2}
              fill="rgb(var(--ft-surface))"
              stroke={color}
              strokeWidth={c.current ? 2 : 1.4}
            />
            {c.current && <circle cx={xAt(c.weekIdx)} cy={midY} r="1.8" fill={color} />}
            <text
              x={xAt(c.weekIdx)} y={height - 5}
              textAnchor="middle"
              fontFamily="var(--ft-font-data)"
              fontSize="8"
              fontWeight="600"
              fill={c.current ? color : "rgb(var(--ft-dim))"}
            >
              W{c.weekIdx + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** "Back on track in N days" mini bar. */
export function TimelineMini({
  days = 14,
  marker = 14,
  label = "days",
}: {
  days?: number;
  marker?: number;
  label?: string;
}) {
  const cells = Array.from({ length: days });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", gap: 1.5, flex: 1 }}>
        {cells.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 5,
            background: i < marker ? "rgb(var(--ft-accent))" : "rgb(var(--ft-border-faint))",
            borderRadius: 1,
          }} />
        ))}
      </div>
      <span className="font-data" style={{ fontSize: 9, fontWeight: 600, color: "rgb(var(--ft-accent))", letterSpacing: ".05em" }}>
        {marker}{label[0]}
      </span>
    </div>
  );
}
