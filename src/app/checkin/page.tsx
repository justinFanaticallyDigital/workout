"use client";

import { useEffect, useState } from "react";
import DetailHeader from "./_components/DetailHeader";
import PendingCheckInCard from "./_components/PendingCheckInCard";
import SnapshotSection from "./_components/SnapshotSection";
import RecommendationStub from "./_components/RecommendationStub";
import LifestyleWeekRow from "./_components/LifestyleWeekRow";
import HistoryStrip, { PastCheckInRow } from "./_components/HistoryStrip";
import CheckInForm from "./_components/CheckInForm";
import ScreenEmpty from "./_components/ScreenEmpty";
import { Plex, Mono, SectionH, Card } from "./_components/primitives";
import type { CheckIn } from "./types";
import { isoWeek } from "./types";

export const dynamic = "force-dynamic";

type View = "loading" | "empty" | "pending" | "form" | "submitted";

export default function CheckInPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [view, setView] = useState<View>("loading");
  const [error, setError] = useState<string | null>(null);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      // R9 — fetch active programId in parallel so the LifestyleWeekRow
      // can scope LifestyleTarget lookup to the current program.
      const [res, homeRes] = await Promise.all([
        fetch("/api/checkins?weeks=12"),
        fetch("/api/home"),
      ]);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { checkIns: CheckIn[] } = await res.json();
      const list = data.checkIns ?? [];
      setCheckIns(list);
      if (homeRes.ok) {
        const home = await homeRes.json();
        setActiveProgramId(home?.activeProgram?.id ?? null);
      }
      if (list.length === 0) {
        setView("empty");
        return;
      }
      const now = new Date();
      const currentWeek = isoWeek(now);
      const thisWeekCheckIn = list.find((c) => {
        const w = isoWeek(new Date(c.date));
        return w.year === currentWeek.year && w.week === currentWeek.week;
      });
      setView(thisWeekCheckIn ? "submitted" : "pending");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setView("empty");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (view === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Mono size={11} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ letterSpacing: ".15em", textTransform: "uppercase" }}>
          Loading…
        </Mono>
      </div>
    );
  }

  if (view === "empty") {
    return (
      <div style={{ minHeight: "100vh", background: "rgb(var(--ft-bg))" }}>
        <ScreenEmpty onStart={() => setView("form")} />
        {error && (
          <div style={{ padding: 16, color: "rgb(var(--ft-danger-fg))" }}>
            <Mono size={11}>{error}</Mono>
          </div>
        )}
      </div>
    );
  }

  if (view === "form") {
    return (
      <div style={{ minHeight: "100vh", background: "rgb(var(--ft-bg))" }}>
        <DetailHeader pending backHref="/gameplan" backLabel="Gameplan" />
        <CheckInForm
          onCancel={() => setView(checkIns.length > 0 ? "pending" : "empty")}
          onSubmitted={() => {
            void load();
          }}
        />
      </div>
    );
  }

  // pending or submitted — both show the page chrome + history; pending
  // surfaces the PendingCheckInCard up top, submitted shows the snapshot.
  const now = new Date();
  const currentWeek = isoWeek(now);
  const thisWeek = checkIns.find((c) => {
    const w = isoWeek(new Date(c.date));
    return w.year === currentWeek.year && w.week === currentWeek.week;
  }) ?? null;
  const past = checkIns.filter((c) => c.id !== thisWeek?.id);

  return (
    <div style={{ minHeight: "100vh", background: "rgb(var(--ft-bg))" }}>
      <DetailHeader checkIn={thisWeek ?? undefined} pending={view === "pending"} />

      {view === "pending" && (
        <div style={{ padding: "16px 16px 4px" }}>
          <PendingCheckInCard onOpen={() => setView("form")} />
        </div>
      )}

      {view === "submitted" && thisWeek && (
        <>
          <SnapshotSection checkIn={thisWeek} priorCheckIns={past} />
          <LifestyleWeekRow programId={activeProgramId} />
          <RecommendationStub />
          <FreeTextRecap checkIn={thisWeek} onEdit={() => setView("form")} />
        </>
      )}

      <HistoryStrip checkIns={checkIns} />

      <div style={{ padding: "8px 16px 24px" }}>
        <SectionH kicker="3 / History" title="Past check-ins" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {past.length === 0 && (
            <Mono size={11} weight={500} color="rgb(var(--ft-text-tertiary))" style={{ display: "block", padding: "10px 0" }}>
              No past check-ins yet.
            </Mono>
          )}
          {past.map((c) => (
            <PastCheckInRow key={c.id} checkIn={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FreeTextRecap({ checkIn, onEdit }: { checkIn: CheckIn; onEdit: () => void }) {
  if (!checkIn.wins && !checkIn.struggles && !checkIn.notes) {
    return (
      <div style={{ padding: "8px 16px 0" }}>
        <Card padding={14}>
          <Plex size={12} weight={400} color="rgb(var(--ft-text-secondary))" style={{ display: "block" }}>
            No reflection text this week.{" "}
            <button
              onClick={onEdit}
              className="font-body"
              style={{
                background: "transparent",
                border: "none",
                color: "rgb(var(--ft-accent))",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Add notes →
            </button>
          </Plex>
        </Card>
      </div>
    );
  }
  return (
    <div style={{ padding: "8px 16px 0" }}>
      <SectionH
        kicker="2.4 / Reflection"
        title="Free text"
        right={
          <button
            onClick={onEdit}
            className="font-body"
            style={{
              background: "transparent",
              border: "none",
              color: "rgb(var(--ft-accent))",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Edit →
          </button>
        }
      />
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
