"use client";

import Link from "next/link";
import { Plex, Mono, SectionH, Card, SmallStat } from "./primitives";
import { StatusGlyph } from "./icons";
import { HistoryTrajectory } from "./charts";
import { CheckIn, deriveTone, weekDateRange, isoWeek } from "../types";

/**
 * History trajectory + summary line. The trajectory chart degrades
 * to a flat baseline since body-weight series isn't on CheckIn —
 * the dots are colored by per-check-in tone (derived from rating
 * average) which IS available.
 */
export default function HistoryStrip({ checkIns }: { checkIns: CheckIn[] }) {
  const recent = checkIns.slice(0, 6).reverse();
  const dots = recent.map((c, i) => ({
    weekIdx: i,
    tone: deriveTone(c) as "green" | "yellow" | "red",
    current: i === recent.length - 1,
  }));

  if (checkIns.length === 0) return null;

  const counts = recent.reduce(
    (acc, c) => {
      const t = deriveTone(c);
      if (t === "green") acc.green++;
      else if (t === "yellow") acc.yellow++;
      else if (t === "red") acc.red++;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 },
  );

  return (
    <div style={{ padding: "8px 16px 4px" }}>
      <SectionH
        kicker="2.3 / Trajectory"
        title="Recent weeks"
        right={
          <Mono size={10} weight={500} color="rgb(var(--ft-text-tertiary))">
            {recent.length} CHECK-IN{recent.length === 1 ? "" : "S"}
          </Mono>
        }
      />
      <Card padding={14}>
        <HistoryTrajectory checkIns={dots} />
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgb(var(--ft-border-faint))", display: "flex", gap: 14 }}>
          <SmallStat label="Strong" value={String(counts.green)} tone="green" />
          <SmallStat label="Mixed" value={String(counts.yellow)} tone="yellow" />
          <SmallStat label="Off" value={String(counts.red)} tone="red" />
        </div>
      </Card>
    </div>
  );
}

/** Past check-in row — date / week / tone glyph / summary line. */
export function PastCheckInRow({ checkIn }: { checkIn: CheckIn }) {
  const tone = deriveTone(checkIn);
  const week = isoWeek(new Date(checkIn.date)).week;
  const dateRange = weekDateRange(checkIn.date);
  const summary = summarize(checkIn);

  return (
    <Link
      href={`/checkin/${checkIn.id}`}
      className="ft-card block"
      style={{
        background: "rgb(var(--ft-surface))",
        border: "1px solid rgb(var(--ft-border))",
        borderRadius: 6,
        padding: "10px 12px",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ marginTop: 4 }}>
          <StatusGlyph tone={tone === "neutral" ? "blue" : tone} size={10} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <Mono size={11} weight={600}>
              W{week}
            </Mono>
            <Plex size={11} weight={500} color="rgb(var(--ft-text-secondary))">
              {dateRange}
            </Plex>
          </div>
          <Plex
            size={11}
            weight={400}
            color="rgb(var(--ft-text-secondary))"
            style={{ display: "block", marginTop: 4, lineHeight: 1.4 }}
          >
            {summary}
          </Plex>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 4 }}>
          <path
            d="M5 3 L9 7 L5 11"
            fill="none"
            stroke="rgb(var(--ft-text-tertiary))"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}

function summarize(c: CheckIn): string {
  if (c.wins) return c.wins.slice(0, 80) + (c.wins.length > 80 ? "…" : "");
  if (c.struggles) return c.struggles.slice(0, 80) + (c.struggles.length > 80 ? "…" : "");
  if (c.notes) return c.notes.slice(0, 80) + (c.notes.length > 80 ? "…" : "");
  const rated = [c.energy, c.sleepQuality, c.soreness, c.stress, c.motivation].filter((v) => v != null).length;
  return `${rated}/5 ratings filled · ${[c.liftAdherence, c.cardioAdherence, c.nutritionAdherence].filter((v) => v != null).length}/3 adherence values`;
}
