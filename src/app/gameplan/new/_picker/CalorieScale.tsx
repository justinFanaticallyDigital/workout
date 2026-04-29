"use client";

/**
 * Calorie scale — horizontal axis from −500 (deficit) to +500
 * (surplus), marker placed at `delta` kcal. Optional `range` shows a
 * recommended band.
 *
 * Verbatim port of picker-screens.jsx#CalorieScale (lines 432–499).
 * Negative delta tints with the danger token, positive with success,
 * near-zero with accent — uses the R0 state-token contract so each
 * chrome's danger/success/accent triplet drives the marker color.
 */

export function CalorieScale({
  delta,
  range,
}: {
  delta: number;
  range?: [number, number];
}) {
  const min = -700;
  const max = 700;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const markerL = Math.max(2, Math.min(98, pct(delta)));
  const bandL = range ? pct(range[0]) : null;
  const bandR = range ? pct(range[1]) : null;
  const sign = delta > 0 ? "+" : "";
  const label =
    delta === 0
      ? "MAINTENANCE"
      : delta > 0
      ? delta > 250
        ? "SURPLUS"
        : "SLIGHT SURPLUS"
      : delta < -250
      ? "DEFICIT"
      : "SLIGHT DEFICIT";
  // Marker color uses R0 state tokens: surplus=success, deficit=danger,
  // near-maintenance=accent. Each chrome resolves these to its palette.
  const colorVar =
    Math.abs(delta) < 50
      ? "rgb(var(--ft-accent))"
      : delta > 0
      ? "rgb(var(--ft-success-fg))"
      : "rgb(var(--ft-danger-fg))";

  return (
    <div style={{ position: "relative", paddingTop: 6, paddingBottom: 18 }}>
      <div style={{ position: "relative", height: 18, marginBottom: 4 }}>
        {/* Track — danger → border-faint → success gradient. Each
            chrome tints via R0 state tokens. */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, rgb(var(--ft-danger-fg)) 0%, rgb(var(--ft-border-faint)) 50%, rgb(var(--ft-success-fg)) 100%)",
            opacity: 0.55,
          }}
        />
        {/* Maintenance tick */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: "rgb(var(--ft-text-tertiary))",
          }}
        />
        {/* Range band */}
        {range && bandL != null && bandR != null && (
          <div
            style={{
              position: "absolute",
              left: `${bandL}%`,
              width: `${bandR - bandL}%`,
              top: 6,
              height: 6,
              background: colorVar,
              opacity: 0.33,
              border: `1px solid ${colorVar}`,
            }}
          />
        )}
        {/* Marker */}
        <div
          style={{
            position: "absolute",
            left: `${markerL}%`,
            top: -2,
            bottom: -2,
            transform: "translateX(-50%)",
            width: 2,
            background: colorVar,
            boxShadow: `0 0 6px ${colorVar}`,
          }}
        />
        <div
          className="font-data tabular-nums"
          style={{
            position: "absolute",
            left: `${markerL}%`,
            top: -10,
            transform: "translateX(-50%)",
            fontSize: 14,
            color: colorVar,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {sign}
          {delta}
        </div>
      </div>
      <div
        className="font-body"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 8,
          letterSpacing: ".2em",
          color: "rgb(var(--ft-text-tertiary))",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        <span style={{ color: "rgb(var(--ft-danger-fg))" }}>−500 DEFICIT</span>
        <span>MAINT</span>
        <span style={{ color: "rgb(var(--ft-success-fg))" }}>+500 SURPLUS</span>
      </div>
      <div
        className="font-body"
        style={{
          position: "absolute",
          right: 0,
          top: -2,
          fontSize: 9,
          letterSpacing: ".25em",
          color: colorVar,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
