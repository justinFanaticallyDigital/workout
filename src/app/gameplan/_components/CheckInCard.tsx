"use client";

/**
 * Pending weekly check-in card — verbatim layout port of
 * gameplan-active.jsx#CheckInCard (lines 549–597).
 *
 * R8: implemented in goal-engine. The badge + heading + body are now
 * driven by live `Recommendation` rows fetched from
 * `/api/recommendations?status=pending`. When recs exist, the card
 * shows the count + the topmost rec's title; when none, it falls back
 * to the PENDING / REVIEWED check-in framing.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { GCard } from "./GCard";
import { Marker, Archivo } from "./typography";
import { SprayUnderline } from "./Ornaments";
import type { CheckIn } from "./types";

interface RecRow {
  id: string;
  kind: string;
  severity: "info" | "warning" | "urgent";
  title: string;
  body: string;
}

export function CheckInCard({
  recentCheckIns,
  tilt = 0.3,
}: {
  recentCheckIns: CheckIn[];
  tilt?: number;
}) {
  const [recs, setRecs] = useState<RecRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/recommendations?status=pending&limit=3")
      .then((r) => (r.ok ? r.json() : { recommendations: [] }))
      .then((data) => {
        if (cancelled) return;
        setRecs(Array.isArray(data?.recommendations) ? data.recommendations : []);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasThisWeek = haveCheckInThisWeek(recentCheckIns);
  const hasRecs = recs.length > 0;
  // R8 priority: live recommendations dominate when present;
  // otherwise fall back to the prior PENDING / REVIEWED framing.
  const tag = hasRecs ? `${recs.length} REC${recs.length === 1 ? "" : "S"}` : hasThisWeek ? "REVIEWED" : "PENDING";
  const tagColor = hasRecs
    ? recs[0].severity === "urgent"
      ? "rgb(var(--ft-legs))"
      : recs[0].severity === "warning"
      ? "rgb(var(--ft-core))"
      : "rgb(var(--ft-pull))"
    : hasThisWeek
    ? "rgb(var(--ft-pull))"
    : "rgb(var(--ft-core))";
  const heading = hasRecs
    ? "ENGINE RECOMMENDATIONS"
    : hasThisWeek
    ? "CHECK-IN COMPLETE"
    : "WEEKLY CHECK-IN";
  const headline = hasRecs
    ? recs[0].title
    : hasThisWeek
    ? "RECOMMENDATIONS PENDING"
    : "GIVE ME 60 SECONDS";
  const body = hasRecs
    ? recs[0].body
    : hasThisWeek
    ? "Latest reflection logged. The Goal Engine generates recommendations on each weekly check-in."
    : "Your weekly check-in runs the Goal Engine and unlocks recommendations. Quick — about a minute.";
  const ctaLabel = hasRecs ? "VIEW ALL →" : hasThisWeek ? "VIEW CHECK-IN →" : "OPEN CHECK-IN →";
  void loaded;

  return (
    <GCard
      tilt={tilt}
      padding={16}
      freshTape={hasRecs ? "FRESH" : hasThisWeek ? undefined : "FRESH"}
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
            {headline}
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
