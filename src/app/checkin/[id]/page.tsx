"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DetailHeader from "../_components/DetailHeader";
import SnapshotSection from "../_components/SnapshotSection";
import RecommendationStub from "../_components/RecommendationStub";
import { Plex, Mono, SectionH, Card } from "../_components/primitives";
import type { CheckIn } from "../types";

export const dynamic = "force-dynamic";

/**
 * Past check-in detail. Routed to from PastCheckInRow taps in the
 * /checkin history list. Read-only view of one CheckIn record.
 */
export default function CheckInDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [priorCheckIns, setPriorCheckIns] = useState<CheckIn[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/checkins/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/checkins?weeks=12").then((r) => (r.ok ? r.json() : { checkIns: [] })),
    ])
      .then(([detail, list]) => {
        if (cancelled) return;
        if (!detail || !detail.checkIn) {
          setError("Check-in not found");
          return;
        }
        setCheckIn(detail.checkIn as CheckIn);
        const prior = (list.checkIns as CheckIn[]).filter((c) => c.id !== detail.checkIn.id);
        setPriorCheckIns(prior);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div style={{ minHeight: "60vh", padding: 24, textAlign: "center", background: "rgb(var(--ft-bg))" }}>
        <Mono size={11} weight={500} color="rgb(var(--ft-danger-fg))">{error}</Mono>
        <div style={{ marginTop: 12 }}>
          <Link href="/checkin" className="font-body" style={{ color: "rgb(var(--ft-accent))", fontSize: 12 }}>
            ← back to check-ins
          </Link>
        </div>
      </div>
    );
  }

  if (!checkIn) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "rgb(var(--ft-bg))" }}>
        <Mono size={11} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".15em", textTransform: "uppercase" }}>
          Loading…
        </Mono>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "rgb(var(--ft-bg))" }}>
      <DetailHeader checkIn={checkIn} backHref="/checkin" backLabel="Check-ins" />
      <SnapshotSection checkIn={checkIn} priorCheckIns={priorCheckIns} />
      <RecommendationStub />
      <FreeTextSection checkIn={checkIn} />
    </div>
  );
}

function FreeTextSection({ checkIn }: { checkIn: CheckIn }) {
  if (!checkIn.wins && !checkIn.struggles && !checkIn.notes) {
    return (
      <div style={{ padding: "8px 16px 24px" }}>
        <Card padding={14}>
          <Plex size={12} weight={400} color="rgb(var(--ft-text-tertiary))" style={{ display: "block" }}>
            No reflection text saved for this check-in.
          </Plex>
        </Card>
      </div>
    );
  }
  return (
    <div style={{ padding: "8px 16px 24px" }}>
      <SectionH kicker="2.4 / Reflection" title="Free text" />
      <Card padding={14}>
        {checkIn.wins && (
          <div style={{ marginBottom: 10 }}>
            <Mono size={9} weight={600} color="rgb(var(--ft-success-fg))" style={{ letterSpacing: ".15em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              Wins
            </Mono>
            <Plex size={13} weight={400} style={{ display: "block", lineHeight: 1.5 }}>
              {checkIn.wins}
            </Plex>
          </div>
        )}
        {checkIn.struggles && (
          <div style={{ marginBottom: 10 }}>
            <Mono size={9} weight={600} color="rgb(var(--ft-warn-fg))" style={{ letterSpacing: ".15em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              Struggles
            </Mono>
            <Plex size={13} weight={400} style={{ display: "block", lineHeight: 1.5 }}>
              {checkIn.struggles}
            </Plex>
          </div>
        )}
        {checkIn.notes && (
          <div>
            <Mono size={9} weight={600} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".15em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              Notes
            </Mono>
            <Plex size={13} weight={400} style={{ display: "block", lineHeight: 1.5 }}>
              {checkIn.notes}
            </Plex>
          </div>
        )}
      </Card>
    </div>
  );
}
