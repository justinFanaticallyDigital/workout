"use client";

/**
 * Post-workout summary card — verbatim port of gameplan-active.jsx
 * #NextActionLogged (lines 479–544): rotated check stamp + "LOGGED
 * TODAY" badge + 3-stat grid (VOLUME / TOP SET / TIME) + tomorrow
 * preview row + VIEW SESSION CTA.
 */

import Link from "next/link";
import { GCard } from "./GCard";
import { Marker, Reenie, Archivo } from "./typography";
import { SprayUnderline, ButtonSpray, DashedDivider } from "./Ornaments";

type MoveKind = "push" | "pull" | "legs" | "core";

export interface LoggedSummary {
  /** Movement-color key for the rotated check stamp + accent. */
  moveKind: MoveKind;
  /** "PULL" / "LEGS" / etc. — short caps display name. */
  shortName: string;
  /** Total volume in lbs (already summed). */
  volumeLbs: number;
  /** Top set weight × reps. */
  topSet: { weight: number; reps: number } | null;
  /** Workout duration in minutes. */
  minutes: number;
  /** Workout id for VIEW SESSION link. */
  workoutId: string;
  /** Tomorrow's preview pulled from the active block's day cycle. */
  tomorrow: { name: string; moveKind: MoveKind; dayNumber: number } | null;
}

export function NextActionLogged({
  summary,
  tilt = -0.3,
}: {
  summary: LoggedSummary;
  tilt?: number;
}) {
  const accentVar = `rgb(var(--ft-${summary.moveKind}))`;
  return (
    <GCard accent={accentVar} tilt={tilt} padding={16}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              border: "2px solid rgb(var(--ft-success-border))",
              background: "rgb(var(--ft-success-bg))",
              display: "grid",
              placeItems: "center",
              transform: "rotate(-3deg)",
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M5 13 L10 18 L20 7"
                fill="none"
                stroke={accentVar}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Archivo size={9} color={accentVar} style={{ letterSpacing: ".20em", textTransform: "uppercase" }}>
              LOGGED TODAY
            </Archivo>
            <Marker
              style={{
                fontSize: 30,
                color: "rgb(var(--ft-text-primary))",
                display: "block",
                lineHeight: 1,
                marginTop: 2,
                transform: "rotate(-1deg)",
                transformOrigin: "left",
              }}
            >
              {summary.shortName.toUpperCase()} ✓
            </Marker>
            <SprayUnderline width={88} color={accentVar} style={{ marginTop: 1, marginLeft: -3 }} />
          </div>
        </div>
      </div>

      <DashedDivider style={{ margin: "14px 0 10px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <Stat label="VOLUME" val={fmtVolume(summary.volumeLbs)} sub="LBS" />
        <Stat
          label="TOP SET"
          val={summary.topSet ? String(summary.topSet.weight) : "—"}
          sub={summary.topSet ? `× ${summary.topSet.reps}` : ""}
        />
        <Stat label="TIME" val={String(summary.minutes)} sub="MIN" />
      </div>

      {summary.tomorrow && (
        <>
          <DashedDivider style={{ margin: "14px 0 10px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Archivo
                size={8}
                color="rgb(var(--ft-text-tertiary))"
                style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
              >
                TOMORROW
              </Archivo>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    background: `rgb(var(--ft-${summary.tomorrow.moveKind}))`,
                  }}
                />
                <Marker style={{ fontSize: 16, color: "rgb(var(--ft-text-primary))" }}>
                  DAY {summary.tomorrow.dayNumber} — {summary.tomorrow.name.toUpperCase()}
                </Marker>
              </div>
            </div>
            <Link
              href={`/history/${summary.workoutId}`}
              style={{ position: "relative", textDecoration: "none" }}
            >
              <Archivo
                size={11}
                color="rgb(var(--ft-text-primary))"
                style={{ letterSpacing: ".10em", textTransform: "uppercase" }}
              >
                VIEW SESSION
              </Archivo>
              <ButtonSpray width={130} color="rgb(var(--ft-info-fg))" style={{ marginTop: -1 }} />
            </Link>
          </div>
        </>
      )}
    </GCard>
  );
}

function Stat({ label, val, sub }: { label: string; val: string; sub: string }) {
  return (
    <div>
      <Archivo
        size={8}
        color="rgb(var(--ft-text-tertiary))"
        style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
      >
        {label}
      </Archivo>
      <div style={{ marginTop: 2, display: "flex", alignItems: "baseline", gap: 4 }}>
        <Reenie style={{ fontSize: 30, color: "rgb(var(--ft-text-primary))" }}>{val}</Reenie>
        {sub && (
          <Archivo size={9} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
            {sub}
          </Archivo>
        )}
      </div>
    </div>
  );
}

function fmtVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
}
