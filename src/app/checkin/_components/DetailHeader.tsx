"use client";

import Link from "next/link";
import { Plex, Mono, Pill } from "./primitives";
import { weekDateRange, isoWeek, pseudoSpecimenId } from "../types";
import type { CheckIn } from "../types";

/**
 * Page header for /checkin (and /checkin/[id]). Per the prototype's
 * DetailHeader. Status pill defaults to "Reviewed". R8: implemented
 * in goal-engine — Apply / Dismiss / Open-in-Planning-Mode actions
 * live in `RecommendationStub` (next sibling component on the page).
 */
export default function DetailHeader({
  checkIn,
  pending = false,
  backHref = "/gameplan",
  backLabel = "Gameplan",
}: {
  checkIn?: CheckIn;
  pending?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  const now = new Date();
  const week = checkIn ? isoWeek(new Date(checkIn.date)).week : isoWeek(now).week;
  const dateRange = checkIn ? weekDateRange(checkIn.date) : weekDateRange(now.toISOString());
  const specimen = checkIn ? pseudoSpecimenId(checkIn) : `SPECIMEN # ${now.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  const statusPill = pending
    ? <Pill tone="warn" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>Pending</Pill>
    : <Pill tone="neutral" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>Reviewed</Pill>;

  return (
    <div
      style={{
        background: "rgb(var(--ft-surface))",
        borderBottom: "1px solid rgb(var(--ft-border))",
        padding: "14px 16px 14px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8 }}>
        <Link href={backHref} className="inline-flex items-center gap-1.5" style={{ color: "rgb(var(--ft-text-secondary))" }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M9 3 L4.5 7 L9 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Plex size={12} weight={500} color="rgb(var(--ft-text-secondary))">{backLabel}</Plex>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Mono size={9} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em", whiteSpace: "nowrap" }}>
            {specimen}
          </Mono>
          {statusPill}
        </div>
      </div>
      <div>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-.01em", color: "rgb(var(--ft-text-primary))", margin: 0 }}>
          Weekly Check-In
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Mono size={11} weight={500} color="rgb(var(--ft-text-secondary))">{dateRange}</Mono>
          <span style={{ width: 3, height: 3, background: "rgb(var(--ft-text-tertiary))", borderRadius: "50%" }} />
          <Mono size={11} weight={500} color="rgb(var(--ft-text-secondary))">Week {week}</Mono>
        </div>
      </div>
    </div>
  );
}
