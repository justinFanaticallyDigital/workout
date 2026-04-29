"use client";

/**
 * Pending weekly check-in card — verbatim port of gameplan-active.jsx
 * #CheckInCard (lines 549–597).
 *
 * **R8 stub (per R5 hot question 2)**: the prototype shows a
 * recommendation count ("2 RECOMMENDATIONS") and engine guidance text.
 * Live has no Goal Engine output yet — we render:
 *   - "PENDING" badge when no check-in exists this ISO week
 *   - "REVIEWED" badge when a check-in was logged this ISO week
 *   - Generic guidance text instead of an engine-specific preview
 * When R8 lands, swap the body for the engine recommendation feed.
 */

import Link from "next/link";
import { GCard } from "./GCard";
import { Marker, Archivo } from "./typography";
import { SprayUnderline } from "./Ornaments";
import type { CheckIn } from "./types";

export function CheckInCard({
  recentCheckIns,
  tilt = 0.3,
}: {
  recentCheckIns: CheckIn[];
  tilt?: number;
}) {
  const hasThisWeek = haveCheckInThisWeek(recentCheckIns);
  const tag = hasThisWeek ? "REVIEWED" : "PENDING";
  const tagColor = hasThisWeek ? "rgb(var(--ft-pull))" : "rgb(var(--ft-core))";
  const heading = hasThisWeek ? "CHECK-IN COMPLETE" : "WEEKLY CHECK-IN";
  const body = hasThisWeek
    ? "Latest reflection logged. Engine recommendations open up here once the Goal Engine ships."
    : "Your weekly check-in unlocks engine recommendations. Quick — about a minute.";
  const ctaLabel = hasThisWeek ? "VIEW CHECK-IN →" : "OPEN CHECK-IN →";

  return (
    <GCard
      tilt={tilt}
      padding={16}
      freshTape={hasThisWeek ? undefined : "FRESH"}
      style={{ borderLeft: "4px solid rgb(var(--ft-accent))" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                background: tagColor,
                borderRadius: "50%",
                boxShadow: `0 0 8px ${tagColor}`,
                display: "inline-block",
              }}
            />
            <Archivo size={9} color={tagColor} style={{ letterSpacing: ".20em", textTransform: "uppercase" }}>
              {tag} · {heading}
            </Archivo>
          </div>
          <Marker
            style={{
              fontSize: 22,
              color: "rgb(var(--ft-text-primary))",
              display: "block",
              lineHeight: 1.05,
              transform: "rotate(-.8deg)",
              transformOrigin: "left",
            }}
          >
            {hasThisWeek ? "RECOMMENDATIONS PENDING" : "GIVE ME 60 SECONDS"}
          </Marker>
          <SprayUnderline width={170} color="rgb(var(--ft-warn-fg))" style={{ marginTop: 1, marginLeft: -3 }} />
        </div>
      </div>

      <Archivo
        size={11}
        color="rgb(var(--ft-text-secondary))"
        style={{ display: "block", marginTop: 10, lineHeight: 1.45 }}
      >
        {body}
      </Archivo>

      <Link
        href="/checkin"
        style={{
          display: "block",
          marginTop: 14,
          border: "2px solid rgb(var(--ft-warn-fg))",
          background: "rgb(var(--ft-warn-bg))",
          padding: "10px 14px",
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        <Marker style={{ fontSize: 18, color: "rgb(var(--ft-text-primary))", letterSpacing: ".02em" }}>
          {ctaLabel}
        </Marker>
      </Link>
    </GCard>
  );
}

/** ISO-week helper — compares the latest check-in against now. */
function haveCheckInThisWeek(checkIns: CheckIn[]): boolean {
  const latest = checkIns[0];
  if (!latest) return false;
  const ld = new Date(latest.date);
  const now = new Date();
  return isoWeek(ld) === isoWeek(now);
}

function isoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}
