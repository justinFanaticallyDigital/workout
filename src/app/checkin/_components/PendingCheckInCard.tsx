"use client";

import { Plex, Mono, Pill } from "./primitives";
import { IconWarn, IconPulse, IconMoon, IconFlame, StatusGlyph } from "./icons";
import { isoWeek, weekDateRange } from "../types";

/**
 * Pending check-in card. The prototype's data-source ("X lb behind
 * weight target. N recommendations") doesn't map to the live
 * self-report schema — repurposed to: "8 fields to check in on.
 * Quick — about a minute."
 *
 * compact = condensed variant for embedding in the Gameplan tab
 * (R5 will use this). Default = full card for /checkin entry.
 */
export default function PendingCheckInCard({
  compact = false,
  onOpen,
}: {
  compact?: boolean;
  onOpen?: () => void;
}) {
  const now = new Date();
  const { week } = isoWeek(now);
  const dateRange = weekDateRange(now.toISOString());
  const specimenId = `SPECIMEN # ${now.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;

  return (
    <div
      style={{
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        borderRadius: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent stripe (warning amber) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "rgb(var(--ft-warn))",
        }}
      />

      <div style={{ padding: "14px 14px 14px 18px" }}>
        {/* Top row: severity pill + specimen */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Pill tone="warn" icon={IconWarn}>Action Needed</Pill>
          <Mono size={8.5} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".12em" }}>
            {specimenId}
          </Mono>
        </div>

        {/* Title + week */}
        <div style={{ marginBottom: 6 }}>
          <Plex size={15} weight={600}>Weekly Check-In</Plex>
          <Plex size={13} weight={400} color="rgb(var(--ft-text-secondary))" style={{ marginLeft: 6 }}>·</Plex>
          <Plex size={13} weight={500} color="rgb(var(--ft-text-secondary))" style={{ marginLeft: 6 }}>Week {week}</Plex>
        </div>
        <Mono size={11} weight={400} color="rgb(var(--ft-text-tertiary))" style={{ display: "block", marginBottom: 10 }}>
          {dateRange}
        </Mono>

        {/* Summary line — repurposed from the prototype's "X behind / N recs" */}
        <Plex size={13} weight={400} color="rgb(var(--ft-text-secondary))" style={{ display: "block", lineHeight: 1.5 }}>
          <Mono size={13} weight={600} color="rgb(var(--ft-text-primary))">8</Mono> fields to check in on. Quick — about a minute.
        </Plex>

        {!compact && (
          <div style={{ display: "flex", gap: 6, marginTop: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <PendingChip Icon={IconPulse} label="Energy" />
            <PendingChip Icon={IconMoon} label="Sleep" />
            <PendingChip Icon={IconFlame} label="Motivation" />
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onOpen}
          className="font-body"
          style={{
            width: "100%",
            background: "rgb(var(--ft-accent))",
            color: "rgb(var(--ft-text-on-accent))",
            border: "none",
            borderRadius: 6,
            padding: "11px 14px",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: ".01em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: compact ? 12 : 0,
          }}
        >
          Open check-in
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M3 7 L11 7 M7.5 3.5 L11 7 L7.5 10.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PendingChip({ Icon, label }: { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        background: "rgb(var(--ft-bg-alt))",
        border: "1px solid rgb(var(--ft-border-faint))",
        borderRadius: 4,
      }}
    >
      <Icon size={12} color="rgb(var(--ft-text-tertiary))" />
      <Plex size={10.5} weight={500} color="rgb(var(--ft-text-secondary))">{label}</Plex>
      <Mono size={10.5} weight={600} color="rgb(var(--ft-text-tertiary))">—</Mono>
      <StatusGlyph tone="yellow" size={8} />
    </div>
  );
}
